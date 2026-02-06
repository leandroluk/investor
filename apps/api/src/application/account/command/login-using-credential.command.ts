import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort, HasherPort, TokenPort} from '#/domain/_shared/port';
import {DeviceEntity, LoginEntity, UserEntity} from '#/domain/account/entity';
import {DeviceTypeEnum} from '#/domain/account/enum';
import {UserInvalidCredentialsError} from '#/domain/account/error';
import {UserLoggedInEvent, UserRequestChallengeEvent} from '#/domain/account/event';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repository';
import {SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string().min(1),
  fingerprint: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingCredentialCommand extends Command<CommandSchema> {
  readonly ip!: string;

  readonly fingerprint!: string;

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

export class LoginUsingCredentialCommandResult implements TokenPort.Authorization {
  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGci...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Expires in',
    example: 3600,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGci...',
  })
  refreshToken?: string;
}

@CommandHandler(LoginUsingCredentialCommand)
export class LoginUsingCredentialHandler implements ICommandHandler<
  LoginUsingCredentialCommand,
  LoginUsingCredentialCommandResult
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly deviceRepository: DeviceRepository,
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
    const isValid = this.hasherPort.compare(plain, hash);
    if (!isValid) {
      throw new UserInvalidCredentialsError();
    }
  }

  private async upsertDevice(user: UserEntity, fingerprint: DeviceEntity['fingerprint']): Promise<DeviceEntity> {
    const existingDevice = await this.deviceRepository.findByFingerprint(user.id, fingerprint);
    if (existingDevice) {
      existingDevice.isActive = true;
      existingDevice.updatedAt = new Date();
      await this.deviceRepository.update(existingDevice);
      return existingDevice;
    } else {
      const newDevice: DeviceEntity = {
        id: uuid.v7(),
        userId: user.id,
        platform: DeviceTypeEnum.UNKNOWN,
        fingerprint,
        isActive: false,
        brand: 'unknown',
        model: 'unknown',
        name: 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.deviceRepository.create(newDevice);
      return newDevice;
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

  private async createToken(user: UserEntity, device: DeviceEntity): Promise<Required<TokenPort.Authorization>> {
    const sessionKey = await this.sessionStore.create(user.id, device.fingerprint);
    const deviceFingerprintHash = this.hasherPort.hash(device.fingerprint);
    const result = this.tokenPort.create<true>(sessionKey, user, deviceFingerprintHash, true);
    return result;
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
      const device = await this.upsertDevice(user, command.fingerprint);
      const result = await this.createToken(user, device);

      if (user.twoFactorEnabled) {
        await this.publishUserRequestChallengeEvent(command.correlationId, command.occurredAt, user);
      }

      await this.publishUserLoggedInEvent(command.correlationId, command.occurredAt, user.id);

      return result;
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    }
  }
}
