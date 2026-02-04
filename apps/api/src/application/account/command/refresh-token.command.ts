import {Command} from '#/application/_shared/bus';
import {TokenPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {AuthSessionExpiredError, AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  refreshToken: z.string().min(1),
  ip: z.string(),
  userAgent: z.string(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RefreshTokenCommand extends Command<CommandSchema> {
  @ApiProperty({
    description: 'Refresh token to exchange for a new access token',
    example: 'ey...',
  })
  readonly refreshToken!: string;

  readonly ip!: string;
  readonly userAgent!: string;

  constructor(payload: RefreshTokenCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, TokenPort.Authorization> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionStore: SessionStore,
    private readonly tokenPort: TokenPort
  ) {}

  private async decodeToken(refreshToken: string): Promise<TokenPort.Decoded> {
    const decoded = await this.tokenPort.decode(refreshToken);

    if (decoded.kind !== 'refresh') {
      throw new AuthUnauthorizedError();
    }

    return decoded;
  }

  private async getUser(userId: UserEntity['id']): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.status === UserStatusEnum.PENDING) {
      throw new AuthUnauthorizedError();
    }

    return user;
  }

  private async refreshSession(
    userId: UserEntity['id'],
    sessionKey: string,
    ip: string,
    userAgent: string
  ): Promise<void> {
    try {
      await this.sessionStore.refresh(userId, sessionKey, ip, userAgent);
    } catch {
      throw new AuthSessionExpiredError();
    }
  }

  async execute(command: RefreshTokenCommand): Promise<TokenPort.Authorization> {
    const decoded = await this.decodeToken(command.refreshToken);
    const user = await this.getUser(decoded.claims.subject);
    await this.refreshSession(user.id, decoded.sessionKey, command.ip, command.userAgent);
    const result = await this.tokenPort.create<true>(decoded.sessionKey, user, true);
    return result;
  }
}
