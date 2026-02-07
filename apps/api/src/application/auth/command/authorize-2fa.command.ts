import {Command} from '#/application/_shared/bus';
import {ChallengeEntity, UserEntity} from '#/domain/account/entity';
import {ChallengeStatusEnum, UserStatusEnum} from '#/domain/account/enum';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/error';
import {ChallengeRepository, UserRepository} from '#/domain/account/repository';
import {ChallengeStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  challengeId: z.uuid(),
  otp: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class Authorize2FACommand extends Command<CommandSchema> {
  @ApiProperty({
    description: 'Challenge ID',
  })
  readonly challengeId!: string;

  @ApiProperty({
    description: '2FA Code',
    example: '123456',
  })
  readonly otp!: string;

  constructor(payload: Authorize2FACommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(Authorize2FACommand)
export class Authorize2FAHandler implements ICommandHandler<Authorize2FACommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly challengeStore: ChallengeStore
  ) {}

  private async verifyChallenge(challengeId: string, code: string): Promise<ChallengeEntity> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new UserInvalidOtpError('Challenge not found');
    }
    if (challenge.status !== ChallengeStatusEnum.PENDING) {
      throw new UserInvalidOtpError('Challenge already used');
    }
    if (challenge.expiresAt < new Date()) {
      challenge.status = ChallengeStatusEnum.EXPIRED;
      challenge.updatedAt = new Date();
      await this.challengeRepository.update(challenge);
      throw new UserInvalidOtpError('Challenge expired');
    }
    if (challenge.code !== code) {
      throw new UserInvalidOtpError('Invalid OTP');
    }

    challenge.status = ChallengeStatusEnum.COMPLETED;
    challenge.updatedAt = new Date();
    await this.challengeRepository.update(challenge);
    await this.challengeStore.delete(challenge.userId);

    return challenge;
  }

  private async checkUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async execute(command: Authorize2FACommand): Promise<void> {
    const challenge = await this.verifyChallenge(command.challengeId, command.otp);
    await this.checkUser(challenge.userId);
  }
}
