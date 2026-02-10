import {Command} from '#/application/_shared/bus';
import {authorizationTokenSchema} from '#/application/_shared/types';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, HasherPort, TokenPort} from '#/domain/_shared/ports';
import {DeviceEntity, LoginEntity, UserEntity} from '#/domain/account/entities';
import {DeviceTypeEnum, LoginStrategyEnum} from '#/domain/account/enums';
import {UserInvalidCredentialsError} from '#/domain/account/errors';
import {UserLoggedInEvent, UserRequestChallengeEvent} from '#/domain/account/events';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repositories';
import {SessionStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import uuid from 'uuid';
import z from 'zod';

export class LoginUsingCredentialCommand extends createClass(
  Command,
  z.object({
    ip: z.string().min(1),
    fingerprint: z.string().min(1),
    email: UserEntity.schema.shape.email,
    password: z.string().min(1).meta({
      description: 'User password',
      example: 'Test@123',
    }),
  })
) {}

export class LoginUsingCredentialCommandResult extends createClass(authorizationTokenSchema) {}

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
      const newDevice = DeviceEntity.new({
        id: uuid.v7(),
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

  private async createLogin(
    ip: string,
    user: UserEntity,
    success: boolean,
    deviceId: string,
    failureReason: string | null = null
  ): Promise<void> {
    const login = LoginEntity.new({
      id: uuid.v7(),
      ip,
      success,
      userId: user.id,
      deviceId,
      strategy: LoginStrategyEnum.PASSWORD,
      failureReason: failureReason,
      createdAt: new Date(),
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
        strategy: LoginStrategyEnum.PASSWORD,
      })
    );
  }

  async execute(command: LoginUsingCredentialCommand): Promise<LoginUsingCredentialCommandResult> {
    const user = await this.getUserByEmail(command.email);
    const device = await this.upsertDevice(user, command.fingerprint);
    try {
      await this.validatePassword(command.password, user.passwordHash);
      await this.createLogin(command.ip, user, true, device.id);
      const result = await this.createToken(user, device);

      if (user.twoFactorEnabled) {
        await this.publishUserRequestChallengeEvent(command.correlationId, command.occurredAt, user);
      }

      await this.publishUserLoggedInEvent(command.correlationId, command.occurredAt, user.id);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      void this.createLogin(command.ip, user, false, device.id, errorMessage);
      throw error;
    }
  }
}
