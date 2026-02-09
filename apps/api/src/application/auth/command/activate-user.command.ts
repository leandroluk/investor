import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort} from '#/domain/_shared/ports';
import {UserEntity} from '#/domain/account/entities';
import {UserStatusEnum} from '#/domain/account/enums';
import {UserInvalidOtpError, UserNotFoundError, UserNotPendingError} from '#/domain/account/errors';
import {UserActivatedEvent} from '#/domain/account/events';
import {UserRepository} from '#/domain/account/repositories';
import {OtpStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ActivateUserCommand extends createClass(
  Command,
  z.object({
    email: UserEntity.schema.shape.email,
    otp: z.string().length(6).meta({
      description: 'One Time Password',
      example: '123456',
      minLength: 6,
      maxLength: 6,
    }),
  })
) {}

@CommandHandler(ActivateUserCommand)
export class ActivateUserCommandHandler implements ICommandHandler<ActivateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.PENDING) {
      throw new UserNotPendingError();
    }
    return user;
  }

  private async verifyOtp(email: string, otp: string): Promise<void> {
    const otpEmail = await this.otpStore.verify(otp);
    if (otpEmail !== email) {
      throw new UserInvalidOtpError();
    }
  }

  private async activateUser(user: UserEntity): Promise<UserEntity> {
    user.updatedAt = new Date();
    user.status = UserStatusEnum.ACTIVE;
    await this.userRepository.update(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(
      new UserActivatedEvent(correlationId, user.createdAt, {
        userId: user.id,
      })
    );
  }

  async execute(command: ActivateUserCommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    await this.verifyOtp(command.email, command.otp);
    const newUser = await this.activateUser(user);
    await this.publishEvent(command.correlationId, newUser);
  }
}
