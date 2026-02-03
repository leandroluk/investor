import {Command} from '#/application/_shared/bus';
import {ApiPropertyOf} from '#/application/_shared/decorator/api-property-of.decorator';
import {BrokerPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {UserNotFoundError} from '#/domain/account/error';
import {UserRequestChallengeEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
import {ChallengeStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  email: z.email(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class Send2FACommand extends Command<CommandSchema> {
  @ApiPropertyOf(UserEntity, 'email')
  readonly email!: string;

  constructor(payload: Send2FACommand) {
    super(payload, commandSchema);
  }
}

export class Send2FACommandResult {
  @ApiProperty({
    description: 'The challenge ID.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  readonly challengeId!: string;

  constructor(payload: Send2FACommandResult) {
    Object.assign(this, payload);
  }
}

@CommandHandler(Send2FACommand)
export class Send2FAHandler implements ICommandHandler<Send2FACommand, Send2FACommandResult> {
  constructor(
    private readonly challengeStore: ChallengeStore,
    private readonly userRepository: UserRepository,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async execute(command: Send2FACommand): Promise<Send2FACommandResult> {
    const user = await this.getUserByEmail(command.email);
    const {challengeId, otp} = await this.challengeStore.create(user.id);
    await this.brokerPort.publish(
      new UserRequestChallengeEvent(command.correlationId, command.occurredAt, {
        userId: user.id,
        email: user.email,
        otp,
        challengeId,
      })
    );
    return {challengeId};
  }
}
