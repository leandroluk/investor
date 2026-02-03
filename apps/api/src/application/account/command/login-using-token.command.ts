import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort, CipherPort, TokenPort} from '#/domain/_shared/port';
import {LoginEntity, UserEntity} from '#/domain/account/entity';
import {UserInvalidCredentialsError} from '#/domain/account/error';
import {UserLoggedInEvent, UserRequestChallengeEvent} from '#/domain/account/event';
import {LoginRepository, UserRepository} from '#/domain/account/repository';
import {SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
  userAgent: z.string(),
  token: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingTokenCommand extends Command<CommandSchema> {
  @ApiPropertyOf(LoginEntity, 'ip')
  readonly ip!: string;

  readonly userAgent!: string;

  @ApiProperty({
    description: 'Encrypted temporary token',
    example: 'eyJ...',
  })
  readonly token!: string;

  constructor(payload: LoginUsingTokenCommand) {
    super(payload, commandSchema);
  }
}

export class LoginUsingTokenCommandResult {
  @ApiProperty()
  otp!: boolean;

  @ApiProperty({
    description: 'Authorization token if OTP is false, otherwise null',
    nullable: true,
  })
  result!: TokenPort.Authorization | null;
}

@CommandHandler(LoginUsingTokenCommand)
export class LoginUsingTokenHandler implements ICommandHandler<LoginUsingTokenCommand, LoginUsingTokenCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly cipherPort: CipherPort,
    private readonly tokenPort: TokenPort,
    private readonly sessionStore: SessionStore,
    private readonly brokerPort: BrokerPort
  ) {}

  private async decryptToken(token: string): Promise<{userId: UserEntity['id']; provider: 'google' | 'microsoft'}> {
    try {
      const {userId, provider, exp} = await this.cipherPort.decrypt<{
        userId: string;
        provider: 'google' | 'microsoft';
        exp: number;
      }>(token);
      if (exp >= Date.now()) {
        return {userId, provider};
      }
    } catch {
      // no need catch
    }
    throw new UserInvalidCredentialsError('Invalid or expired token');
  }

  private async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserInvalidCredentialsError();
    }
    return user;
  }

  private async createLogin(ip: string, user: UserEntity, success: boolean): Promise<void> {
    const login: LoginEntity = {
      id: uuid.v7(),
      ip,
      success,
      userId: user.id,
      createdAt: new Date(),
    };
    await this.loginRepository.create(login);
  }

  private async createToken(
    ip: string,
    userAgent: string,
    user: UserEntity
  ): Promise<Required<TokenPort.Authorization>> {
    const sessionKey = await this.sessionStore.create(user.id, ip, userAgent);
    return await this.tokenPort.create<true>(sessionKey, user, true);
  }

  private async publishUserRequestChallengeEvent(
    correlationId: string,
    occurredAt: Date,
    user: UserEntity
  ): Promise<void> {
    await this.brokerPort.publish(
      new UserRequestChallengeEvent(correlationId, occurredAt, {
        userId: user.id,
        userEmail: user.email,
      })
    );
  }

  private async publishUserLoggedInEvent(
    correlationId: string,
    occurredAt: Date,
    provider: 'google' | 'microsoft',
    userId: UserEntity['id']
  ): Promise<void> {
    await this.brokerPort.publish(
      new UserLoggedInEvent(correlationId, occurredAt, {
        userId,
        provider,
      })
    );
  }

  async execute(command: LoginUsingTokenCommand): Promise<LoginUsingTokenCommandResult> {
    const {userId, provider} = await this.decryptToken(command.token);
    const user = await this.getUserById(userId);
    try {
      await this.createLogin(command.ip, user, true);

      if (user.twoFactorEnabled) {
        await this.publishUserRequestChallengeEvent(command.correlationId, command.occurredAt, user);

        return {otp: true, result: null};
      }

      const token = await this.createToken(command.ip, command.userAgent, user);
      await this.publishUserLoggedInEvent(command.correlationId, command.occurredAt, provider, user.id);
      return {otp: false, result: token};
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    }
  }
}
