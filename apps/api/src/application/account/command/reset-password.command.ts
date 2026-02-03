import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator';
import {BrokerPort, HasherPort} from '#/domain/_shared/port';
import {PASSWORD_REGEX} from '#/domain/account/constant';
import {UserEntity} from '#/domain/account/entity';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/error';
import {UserPasswordChangedEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
import {OtpStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
  password: z.string().regex(PASSWORD_REGEX),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class ResetPasswordCommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  @ApiProperty({description: 'One Time Password', example: '123456', minLength: 6, maxLength: 6})
  readonly otp!: string;

  @ApiProperty({description: 'New password', example: 'NewP@ssw0rd!', minLength: 8})
  readonly password!: string;

  constructor(payload: ResetPasswordCommand) {
    super(payload, commandSchema);
  }
}

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

  private async validateOtp(email: string, otp: string): Promise<void> {
    const verifiedEmail = await this.otpStore.verify(otp);
    if (verifiedEmail !== email) {
      throw new UserInvalidOtpError();
    }
  }

  private async updatePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {
    user.passwordHash = await this.hasherPort.hash(newPassword);
    user.updatedAt = new Date();
    await this.userRepository.update(user);
    return user;
  }

  private async publishEvent(correlationId: string, user: UserEntity): Promise<void> {
    await this.brokerPort.publish(new UserPasswordChangedEvent(correlationId, new Date(), {userId: user.id}));
  }

  async execute(command: ResetPasswordCommand): Promise<void> {
    const user = await this.getUserByEmail(command.email);
    await this.validateOtp(command.email, command.otp);
    const updatedUser = await this.updatePassword(user, command.password);
    await this.publishEvent(command.correlationId, updatedUser);
  }
}
