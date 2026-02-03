import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort, HasherPort, TokenPort} from '#/domain/_shared/port';
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
  email: z.email(),
  password: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingCredentialCommand extends Command<CommandSchema> {
  @ApiPropertyOf(LoginEntity, 'ip')
  readonly ip!: string;

  @ApiProperty({
    description: 'User Agent',
    example: 'Mozilla/5.0...',
  })
  readonly userAgent!: string;

  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Test@123',
  })
  readonly password!: string;

  constructor(payload: LoginUsingCredentialCommand) {
    super(payload, commandSchema);
  }
}

export class LoginUsingCredentialCommandResult {
  @ApiProperty()
  otp!: boolean;

  @ApiProperty({
    description: 'Authorization token if OTP is false, otherwise null',
    nullable: true,
  })
  result!: TokenPort.Authorization | null;
}

@CommandHandler(LoginUsingCredentialCommand)
export class LoginUsingCredentialHandler implements ICommandHandler<
  LoginUsingCredentialCommand,
  LoginUsingCredentialCommandResult
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly hasherPort: HasherPort,
    private readonly brokerPort: BrokerPort,
    private readonly sessionStore: SessionStore,
    private readonly tokenPort: TokenPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserInvalidCredentialsError();
    }
    return user;
  }

  private async validatePassword(plain: string, hash: string): Promise<void> {
    const isValid = await this.hasherPort.compare(plain, hash);
    if (!isValid) {
      throw new UserInvalidCredentialsError();
    }
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
    userId: UserEntity['id']
  ): Promise<void> {
    await this.brokerPort.publish(
      new UserLoggedInEvent(correlationId, occurredAt, {
        userId,
        provider: 'credential',
      })
    );
  }

  async execute(command: LoginUsingCredentialCommand): Promise<LoginUsingCredentialCommandResult> {
    const user = await this.getUserByEmail(command.email);
    try {
      await this.validatePassword(command.password, user.passwordHash);
      await this.createLogin(command.ip, user, true);

      if (user.twoFactorEnabled) {
        await this.publishUserRequestChallengeEvent(command.correlationId, command.occurredAt, user);
        return {otp: true, result: null};
      }

      const token = await this.createToken(command.ip, command.userAgent, user);
      await this.publishUserLoggedInEvent(command.correlationId, command.occurredAt, user.id);
      return {otp: false, result: token};
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    }
  }
}
