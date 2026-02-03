import {Command} from '#/application/_shared/bus';
import {TokenPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserInvalidOtpError, UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {ChallengeStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  ip: z.string(),
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

  @ApiProperty({
    description: 'Challenge ID received from login step',
    example: '12345678-1234-1234-1234-123456789012',
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

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  accessToken!: string;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  expiresIn!: number;

  @ApiProperty({example: 'Bearer', description: 'Access token'})
  refreshToken!: string;
}

@CommandHandler(Authorize2FACommand)
export class Authorize2FAHandler implements ICommandHandler<Authorize2FACommand, Authorize2FACommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly challengeStore: ChallengeStore,
    private readonly tokenPort: TokenPort
  ) {}

  private async verifyChallenge(challengeId: string, code: string): Promise<UserEntity['id']> {
    try {
      return await this.challengeStore.verify(challengeId, code);
    } catch {
      throw new UserInvalidOtpError();
    }
  }

  private async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  private async createToken(user: UserEntity): Promise<Required<TokenPort.Authorization>> {
    return await this.tokenPort.create<true>(
      user.id,
      {subject: user.id, email: user.email, givenName: user.name},
      true
    );
  }

  async execute(command: Authorize2FACommand): Promise<Authorize2FACommandResult> {
    const userId = await this.verifyChallenge(command.challengeId, command.code);
    const user = await this.getUserById(userId);

    const token = await this.createToken(user);

    return token;
  }
}
