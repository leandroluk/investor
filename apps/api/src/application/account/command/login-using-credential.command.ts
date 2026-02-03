import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {BrokerPort, HasherPort, MailerPort, TemplatePort, TokenPort} from '#/domain/_shared/port';
import {LoginEntity, UserEntity} from '#/domain/account/entity';
import {UserInvalidCredentialsError, UserNotFoundError} from '#/domain/account/error';
import {UserLoggedInEvent} from '#/domain/account/event';
import {LoginRepository, UserRepository} from '#/domain/account/repository';
import {ChallengeStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
  email: z.email(),
  password: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingCredentialCommand extends Command<CommandSchema> {
  @ApiPropertyOf(LoginEntity, 'ip')
  readonly ip!: string;

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

export class LoginUsingCredentialCommandChallengeResult {
  @ApiProperty({
    description: 'Challenge ID',
    example: '12345678-1234-1234-1234-123456789012',
  })
  challengeId?: string;
}

export class LoginUsingCredentialCommandAuthorizationResult implements TokenPort.Authorization {
  @ApiProperty({example: 'Bearer', description: 'Token type'})
  tokenType!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  accessToken!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  expiresIn!: number;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  refreshToken!: string;
}

export type LoginUsingCredentialCommandResult = {
  type: 'challenge' | 'authorization';
  result: LoginUsingCredentialCommandChallengeResult | LoginUsingCredentialCommandAuthorizationResult;
};

@CommandHandler(LoginUsingCredentialCommand)
export class LoginUsingCredentialHandler implements ICommandHandler<
  LoginUsingCredentialCommand,
  LoginUsingCredentialCommandResult
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly hasherPort: HasherPort,
    private readonly challengeStore: ChallengeStore,
    private readonly templatePort: TemplatePort,
    private readonly brokerPort: BrokerPort,
    private readonly mailerPort: MailerPort,
    private readonly tokenPort: TokenPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
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

  private async sendChallenge(user: UserEntity): Promise<string> {
    const {challengeId, otp: otp} = await this.challengeStore.create(user.id);
    const [html, text] = await Promise.all([
      this.templatePort.render('2fa.html', {otp}),
      this.templatePort.render('2fa.text', {otp}),
    ]);
    await this.mailerPort.send({to: [user.email], subject: '2FA Challenge', text, html});
    return challengeId;
  }

  private async createToken(user: UserEntity): Promise<Required<TokenPort.Authorization>> {
    return await this.tokenPort.create<true>(
      user.id,
      {subject: user.id, email: user.email, givenName: user.name},
      true
    );
  }

  private async publishLoginEvent(correlationId: string, occurredAt: Date, userId: UserEntity['id']): Promise<void> {
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
        return {type: 'challenge', result: {challengeId: await this.sendChallenge(user)}};
      }

      return {type: 'authorization', result: await this.createToken(user)};
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    } finally {
      await this.publishLoginEvent(command.correlationId, command.occurredAt, user.id);
    }
  }
}
