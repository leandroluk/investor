import {Command} from '#/application/_shared/bus';
import {TokenPort} from '#/domain/_shared/port';
import {ChallengeEntity, UserEntity} from '#/domain/account/entity';
import {ChallengeStatusEnum, UserStatusEnum} from '#/domain/account/enum';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/error';
import {ChallengeRepository, UserRepository} from '#/domain/account/repository';
import {ChallengeStore, SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
  userAgent: z.string(),
  challengeId: z.string().uuid(),
  code: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class Authorize2FACommand extends Command<CommandSchema> {
  @ApiProperty({
    description: 'IP Address',
    example: '127.0.0.1',
  })
  readonly ip!: string;

  readonly userAgent!: string;

  @ApiProperty({
    description: 'Challenge ID',
    format: 'uuid',
  })
  readonly challengeId!: string;

  @ApiProperty({
    description: '2FA Code',
    example: '123456',
  })
  readonly code!: string;

  constructor(payload: Authorize2FACommand) {
    super(payload, commandSchema);
  }
}

export class Authorize2FACommandResult implements TokenPort.Authorization {
  @ApiProperty({example: 'Bearer', description: 'Token type'})
  tokenType!: string;

  @ApiProperty({example: 'eyJ...', description: 'Access token'})
  accessToken!: string;

  @ApiProperty({example: 3600, description: 'Expires in'})
  expiresIn!: number;

  @ApiProperty({example: 'eyJ...', description: 'Refresh token'})
  refreshToken?: string;
}

@CommandHandler(Authorize2FACommand)
export class Authorize2FAHandler implements ICommandHandler<Authorize2FACommand, Authorize2FACommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly challengeStore: ChallengeStore,
    private readonly sessionStore: SessionStore,
    private readonly tokenPort: TokenPort
  ) {}

  private async verifyChallenge(challengeId: string, code: string): Promise<ChallengeEntity> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new UserInvalidOtpError();
    }
    if (challenge.status !== ChallengeStatusEnum.PENDING) {
      throw new UserInvalidOtpError();
    }
    if (challenge.expiresAt < new Date()) {
      challenge.status = ChallengeStatusEnum.EXPIRED;
      challenge.updatedAt = new Date();
      await this.challengeRepository.update(challenge);
      throw new UserInvalidOtpError();
    }
    if (challenge.code !== code) {
      // TODO: Increment failure count?
      throw new UserInvalidOtpError();
    }

    challenge.status = ChallengeStatusEnum.COMPLETED;
    challenge.updatedAt = new Date();
    await this.challengeRepository.update(challenge);
    await this.challengeStore.delete(challenge.userId);

    return challenge;
  }

  private async getUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createToken(
    ip: string,
    userAgent: string,
    user: UserEntity
  ): Promise<Required<TokenPort.Authorization>> {
    const sessionKey = await this.sessionStore.create(user.id, ip, userAgent);
    const result = await this.tokenPort.create<true>(sessionKey, user, true);
    return result;
  }

  async execute(command: Authorize2FACommand): Promise<Authorize2FACommandResult> {
    const challenge = await this.verifyChallenge(command.challengeId, command.code);
    const user = await this.getUser(challenge.userId);
    const result = await this.createToken(command.ip, command.userAgent, user);
    return result;
  }
}
