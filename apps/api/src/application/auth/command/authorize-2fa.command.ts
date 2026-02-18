import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {ChallengeEntity, UserEntity} from '#/domain/account/entities';
import {ChallengeStatusEnum, UserStatusEnum} from '#/domain/account/enums';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/errors';
import {ChallengeRepository, UserRepository} from '#/domain/account/repositories';
import {ChallengeStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class Authorize2FACommand extends createClass(
  Command,
  z.object({
    challengeId: z.uuid().meta({
      description: 'Challenge ID',
    }),
    otp: z.string().min(1).meta({
      description: '2FA Code',
      example: '123456',
    }),
  })
) {}

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

    await this.challengeRepository.update(
      Object.assign(challenge, {
        status: ChallengeStatusEnum.COMPLETED,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
    );
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
