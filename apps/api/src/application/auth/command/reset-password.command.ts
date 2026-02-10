import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, HasherPort} from '#/domain/_shared/ports';
import {PASSWORD_REGEX_CONSTANT} from '#/domain/account/constants';
import {UserEntity} from '#/domain/account/entities';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/errors';
import {UserPasswordChangedEvent} from '#/domain/account/events';
import {UserRepository} from '#/domain/account/repositories';
import {OtpStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ResetPasswordCommand extends createClass(
  Command,
  z.object({
    email: UserEntity.schema.shape.email,
    otp: z.string().length(6).meta({
      description: 'One Time Password',
      example: '123456',
      minLength: 6,
      maxLength: 6,
    }),
    password: z.string().regex(PASSWORD_REGEX_CONSTANT).meta({
      description: 'New password',
      example: 'NewP@ssw0rd!',
      minLength: 8,
    }),
  })
) {}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpStore: OtpStore,
    private readonly hasherPort: HasherPort,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async verifyOTP(id: UserEntity['id'], otp: string): Promise<void> {
    const verifiedUserId = await this.otpStore.verify(otp);
    if (verifiedUserId !== id) {
      throw new UserInvalidOtpError();
    }
  }

  private async updatePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {
    user.passwordHash = this.hasherPort.hash(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.update(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(new UserPasswordChangedEvent(correlationId, new Date(), {userId: user.id}));
  }

  async execute(command: ResetPasswordCommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    await this.verifyOTP(user.id, command.otp);
    const updatedUser = await this.updatePassword(user, command.password);
    await this.publishEvent(command.correlationId, updatedUser);
  }
}
