import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, HasherPort} from '#/domain/_shared/ports';
import {AccountUOW} from '#/domain/account';
import {PASSWORD_REGEX_CONSTANT} from '#/domain/account/constants';
import {KycEntity, ProfileEntity, UserEntity} from '#/domain/account/entities';
import {KycStatusEnum, UserRoleEnum, UserStatusEnum} from '#/domain/account/enums';
import {UserEmailInUseError} from '#/domain/account/errors';
import {UserRegisteredEvent} from '#/domain/account/events';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class RegisterUserCommand extends createClass(
  Command,
  z.object({
    name: ProfileEntity.schema.shape.name,
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
    private readonly accountUOW: AccountUOW,
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
    return await this.accountUOW.transaction(async session => {
      const user = UserEntity.new({
        email,
        passwordHash: this.hasherPort.hash(password),
        role: UserRoleEnum.USER,
        status: UserStatusEnum.PENDING,
      });

      const profile = ProfileEntity.new({
        userId: user.id,
        name,
        language: 'en',
        timezone: 'UTC',
      });

      const kyc = KycEntity.new({
        userId: user.id,
        status: KycStatusEnum.NONE,
      });

      await session.user.create(user);
      await session.profile.create(profile);
      await session.kyc.create(kyc);

      return user;
    });
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
