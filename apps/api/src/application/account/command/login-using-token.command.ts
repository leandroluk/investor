import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {BrokerPort, CipherPort, TokenPort} from '#/domain/_shared/port';
import {LoginEntity, UserEntity} from '#/domain/account/entity';
import {UserInvalidCredentialsError, UserNotFoundError} from '#/domain/account/error';
import {UserLoggedInEvent, UserRequestChallengeEvent} from '#/domain/account/event';
import {LoginRepository, UserRepository} from '#/domain/account/repository';
import {ChallengeStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
  token: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingTokenCommand extends Command<CommandSchema> {
  @ApiPropertyOf(LoginEntity, 'ip')
  readonly ip!: string;

  @ApiProperty({
    description: 'Encrypted temporary token',
    example: 'eyJ...',
  })
  readonly token!: string;

  constructor(payload: LoginUsingTokenCommand) {
    super(payload, commandSchema);
  }
}

export class LoginUsingTokenCommandChallengeResult {
  @ApiProperty({
    description: 'Challenge ID',
    example: '12345678-1234-1234-1234-123456789012',
  })
  challengeId!: string;
}

export class LoginUsingTokenCommandAuthorizationResult implements TokenPort.Authorization {
  @ApiProperty({example: 'Bearer', description: 'Token type'})
  tokenType!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  accessToken!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  expiresIn!: number;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  refreshToken!: string;
}

export type LoginUsingTokenCommandResult = {
  type: 'challenge' | 'authorization';
  result: LoginUsingTokenCommandChallengeResult | LoginUsingTokenCommandAuthorizationResult;
};

@CommandHandler(LoginUsingTokenCommand)
export class LoginUsingTokenHandler implements ICommandHandler<LoginUsingTokenCommand, LoginUsingTokenCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly cipherPort: CipherPort,
    private readonly tokenPort: TokenPort,
    private readonly challengeStore: ChallengeStore,
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
      throw new UserNotFoundError();
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

  private async sendChallenge(correlationId: string, occurredAt: Date, user: UserEntity): Promise<string> {
    const {challengeId, otp} = await this.challengeStore.create(user.id);
    await this.brokerPort.publish(
      new UserRequestChallengeEvent(correlationId, occurredAt, {
        userId: user.id,
        challengeId,
        otp,
        email: user.email,
      })
    );
    return challengeId;
  }

  private async createToken(user: UserEntity): Promise<Required<TokenPort.Authorization>> {
    return await this.tokenPort.create<true>(
      user.id,
      {subject: user.id, email: user.email, givenName: user.name},
      true
    );
  }

  private async publishLoginEvent(
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
        return {
          type: 'challenge',
          result: {
            challengeId: await this.sendChallenge(command.correlationId, command.occurredAt, user),
          },
        };
      }

      const token = await this.createToken(user);
      await this.publishLoginEvent(command.correlationId, command.occurredAt, provider, user.id);
      return {type: 'authorization', result: token};
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    }
  }
}
