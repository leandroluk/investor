import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, HasherPort} from '#/domain/_shared/ports';
import {PASSWORD_REGEX_CONSTANT} from '#/domain/account/constants';
import {UserEntity} from '#/domain/account/entities';
import {KycStatusEnum, UserStatusEnum} from '#/domain/account/enums';
import {UserEmailInUseError} from '#/domain/account/errors';
import {UserRegisteredEvent} from '#/domain/account/events';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class RegisterUserCommand extends createClass(
  Command,
  z.object({
    name: UserEntity.schema.shape.name,
    email: UserEntity.schema.shape.email,
    password: z.string().min(1).max(100).regex(PASSWORD_REGEX_CONSTANT).meta({
      description: 'User password used to authenticate',
      minLength: 8,
      maxLength: 100,
      example: 'Test@123',
      pattern: PASSWORD_REGEX_CONSTANT.source,
    }),
  })
) {}

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly brokerPort: BrokerPort,
    private readonly hasherPort: HasherPort
  ) {}

  private async existsByEmail(email: string): Promise<void> {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new UserEmailInUseError(email);
    }
  }

  private async createUser(email: string, name: string, password: string): Promise<UserEntity> {
    const user = UserEntity.new({
      email,
      passwordHash: this.hasherPort.hash(password),
      name,
      walletAddress: null,
      walletVerifiedAt: null,
      walletSeedEncrypted: null,
      kycStatus: KycStatusEnum.NONE,
      kycVerifiedAt: null,
      status: UserStatusEnum.PENDING,
      twoFactorEnabled: false,
      language: 'en',
      timezone: 'UTC',
    });
    await this.userRepository.create(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(
      new UserRegisteredEvent(correlationId, user.createdAt, {
        userId: user.id,
        userEmail: user.email,
      })
    );
  }

  async execute({correlationId, email, name, password}: RegisterUserCommand): Promise<void> {
    await this.existsByEmail(email);
    const user = await this.createUser(email, name, password);
    await this.publishEvent(correlationId, user);
  }
}
