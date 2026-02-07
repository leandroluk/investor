import {Command} from '#/application/_shared/bus';
import {HasherPort, TokenPort} from '#/domain/_shared/port';
import {DeviceEntity, UserEntity} from '#/domain/account/entity';
import {UserStatusEnum} from '#/domain/account/enum';
import {AuthSessionExpiredError, AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/error';
import {UserRepository} from '#/domain/account/repository';
import {SessionStore} from '#/domain/account/store';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  refreshToken: z.string().min(1),
  fingerprint: z.string(),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class RefreshTokenCommand extends Command<CommandSchema> {
  @ApiProperty({
    description: 'Refresh token to exchange for a new access token',
    example: 'ey...',
  })
  readonly refreshToken!: string;

  readonly fingerprint!: string;

  constructor(payload: RefreshTokenCommand) {
    super(payload, commandSchema);
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, TokenPort.Authorization> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionStore: SessionStore,
    private readonly tokenPort: TokenPort,
    private readonly hasherPort: HasherPort
  ) {}

  private async decodeToken(refreshToken: string): Promise<TokenPort.Decoded> {
    const decoded = this.tokenPort.decode(refreshToken);

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
    fingerprint: DeviceEntity['fingerprint']
  ): Promise<void> {
    try {
      await this.sessionStore.refresh(userId, sessionKey, fingerprint);
    } catch {
      throw new AuthSessionExpiredError();
    }
  }

  private async createToken(
    sessionKey: string,
    user: UserEntity,
    fingerprint: string
  ): Promise<TokenPort.Authorization> {
    return this.tokenPort.create<true>({
      sessionKey,
      claims: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        timezone: user.timezone,
        hash: this.hasherPort.hash(fingerprint),
      },
      complete: true,
    });
  }

  async execute(command: RefreshTokenCommand): Promise<TokenPort.Authorization> {
    const decoded = await this.decodeToken(command.refreshToken);
    const user = await this.getUser(decoded.claims.id);
    await this.refreshSession(user.id, decoded.sessionKey, command.fingerprint);
    const result = await this.createToken(decoded.sessionKey, user, command.fingerprint);
    return result;
  }
}
