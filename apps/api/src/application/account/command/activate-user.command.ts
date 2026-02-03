import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {UserInvalidOtpError, UserNotFoundError, UserNotPendingError} from '#/domain/account/error';
import {UserActivatedEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
import {OtpStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class ActivateUserCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  @ApiProperty({description: 'One Time Password', example: '123456', minLength: 6, maxLength: 6})
  readonly otp!: string;

  constructor(payload: ActivateUserCommand) {
    super(payload, commandSchema);
  }
}

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
