import {Command} from '#/application/_shared/bus';
import {authorizationTokenSchema} from '#/application/_shared/types';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, CipherPort, HasherPort, TokenPort} from '#/domain/_shared/ports';
import {DeviceEntity, LoginEntity, UserEntity} from '#/domain/account/entities';
import {DeviceTypeEnum, LoginStrategyEnum, SsoProviderEnum} from '#/domain/account/enums';
import {UserInvalidCredentialsError} from '#/domain/account/errors';
import {UserLoggedInEvent, UserRequestChallengeEvent} from '#/domain/account/events';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repositories';
import {SessionStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class LoginUsingTokenCommand extends createClass(
  Command,
  z.object({
    ip: z.string().min(1),
    fingerprint: z.string().min(1),
    token: z.string().min(1).meta({
      description: 'Encrypted temporary token',
      example: 'eyJ...',
    }),
  })
) {}

export class LoginUsingTokenCommandResult extends createClass(authorizationTokenSchema) {}

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

  private async decryptToken(token: string): Promise<{userId: UserEntity['id']; provider: SsoProviderEnum}> {
    try {
      const value = this.cipherPort.decrypt<{
        userId: string;
        provider: SsoProviderEnum;
        exp: number;
      }>(token);
      if (value.exp >= Date.now()) {
        return {
          userId: value.userId,
          provider: value.provider,
        };
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
      const newDevice = DeviceEntity.new({
        userId: user.id,
        platform: DeviceTypeEnum.UNKNOWN,
        fingerprint,
        isActive: false,
        brand: 'unknown',
        model: 'unknown',
        name: 'unknown',
        pushToken: null,
        metadata: null,
      });
      await this.deviceRepository.create(newDevice);
      return newDevice;
    }
  }

  private async createLogin(ip: string, user: UserEntity, deviceId): Promise<void> {
    const login = LoginEntity.new({
      ip,
      deviceId,
      userId: user.id,
      strategy: LoginStrategyEnum.TOKEN,
      failureReason: null,
      success: true,
    });
    await this.loginRepository.create(login);
  }

  private async createToken(user: UserEntity, device: DeviceEntity): Promise<Required<TokenPort.Authorization>> {
    return this.tokenPort.create<true>({
      sessionKey: await this.sessionStore.create({userId: user.id, deviceFingerprint: device.fingerprint}),
      claims: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        timezone: user.timezone,
        hash: this.hasherPort.hash(device.fingerprint),
      },
      complete: true,
    });
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
        strategy: LoginStrategyEnum.TOKEN,
      })
    );
  }

  async execute(command: LoginUsingTokenCommand): Promise<LoginUsingTokenCommandResult> {
    const {userId} = await this.decryptToken(command.token);
    const user = await this.getUserById(userId);
    try {
      const device = await this.upsertDevice(user, command.fingerprint);
      await this.createLogin(command.ip, user, device.id);
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
