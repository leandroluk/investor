import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {BrokerPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {UserActivatedEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
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
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.status !== UserStatusEnum.PENDING) {
      throw new Error('User is not pending');
    }
    return user;
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
    const oldUser = await this.getUserByEmail(command.email);
    const newUser = await this.activateUser(oldUser);
    await this.publishEvent(command.correlationId, newUser);
  }
}
