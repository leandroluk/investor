import {Command} from '#/application/_shared/bus';
import {BrokerPort, CipherPort, HasherPort, TokenPort} from '#/domain/_shared/port';
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
  token: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class LoginUsingTokenCommand extends Command<CommandSchema> {
  readonly ip!: string;
  readonly fingerprint!: string;

  @ApiProperty({
    description: 'Encrypted temporary token',
    example: 'eyJ...',
  })
  readonly token!: string;

  constructor(payload: LoginUsingTokenCommand) {
    super(payload, commandSchema);
  }
}

export class LoginUsingTokenCommandResult implements TokenPort.Authorization {
  @ApiProperty({description: 'Token type', example: 'Bearer'})
  tokenType!: string;

  @ApiProperty({description: 'Access token', example: 'eyJhbGci...'})
  accessToken!: string;

  @ApiProperty({description: 'Expires in', example: 3600})
  expiresIn!: number;

  @ApiProperty({description: 'Refresh token', example: 'eyJhbGci...'})
  refreshToken?: string;
}

@CommandHandler(LoginUsingTokenCommand)
export class LoginUsingTokenHandler implements ICommandHandler<LoginUsingTokenCommand, LoginUsingTokenCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly loginRepository: LoginRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly cipherPort: CipherPort,
    private readonly tokenPort: TokenPort,
    private readonly hasherPort: HasherPort,
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
        isActive: true,
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
    const sessionKey = await this.sessionStore.create(user, device);
    const deviceFingerprintHash = await this.hasherPort.hash(device.fingerprint);
    const result = await this.tokenPort.create<true>(sessionKey, user, deviceFingerprintHash, true);
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
      const device = await this.upsertDevice(user, command.fingerprint);
      const result = await this.createToken(user, device);

      if (user.twoFactorEnabled) {
        await this.publishUserRequestChallengeEvent(command.correlationId, command.occurredAt, user);
      }

      await this.publishUserLoggedInEvent(command.correlationId, command.occurredAt, provider, user.id);

      return result;
    } catch (error) {
      void this.createLogin(command.ip, user, false);
      throw error;
    }
  }
}
