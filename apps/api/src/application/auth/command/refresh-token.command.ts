import {Command} from '#/application/_shared/bus';
import {authorizationTokenSchema} from '#/application/_shared/types';
import {createClass} from '#/domain/_shared/factories';
import {HasherPort, TokenPort} from '#/domain/_shared/ports';
import {DeviceEntity, ProfileEntity, UserEntity} from '#/domain/account/entities';
import {UserStatusEnum} from '#/domain/account/enums';
import {AuthSessionExpiredError, AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/errors';
import {ProfileRepository, UserRepository} from '#/domain/account/repositories';
import {SessionStore} from '#/domain/account/stores';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class RefreshTokenCommand extends createClass(
  Command,
  z.object({
    refreshToken: z.string().min(1).meta({
      description: 'Refresh token to exchange for a new access token',
      example: 'ey...',
    }),
    fingerprint: z.string(),
  })
) {}

export class RefreshTokenCommandResult extends createClass(authorizationTokenSchema) {}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, RefreshTokenCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
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

  private async getUserAndProfile(userId: UserEntity['id']): Promise<{user: UserEntity; profile: ProfileEntity}> {
    const [user, profile] = await Promise.all([
      this.userRepository.findById(userId),
      this.profileRepository.findByUserId(userId),
    ]);

    if (!user || !profile) {
      throw new UserNotFoundError();
    }

    if (user.status === UserStatusEnum.PENDING) {
      throw new AuthUnauthorizedError();
    }

    return {user, profile};
  }

  private async refreshSession(
    userId: UserEntity['id'],
    sessionKey: string,
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void> {
    try {
      await this.sessionStore.refresh({userId, sessionKey, deviceFingerprint});
    } catch {
      throw new AuthSessionExpiredError();
    }
  }

  private async createToken(
    sessionKey: string,
    user: UserEntity,
    profile: ProfileEntity,
    fingerprint: string
  ): Promise<TokenPort.Authorization> {
    return this.tokenPort.create<true>({
      sessionKey,
      claims: {
        id: user.id,
        email: user.email,
        name: profile.name,
        language: profile.language,
        timezone: profile.timezone,
        hash: this.hasherPort.hash(fingerprint),
      },
      complete: true,
    });
  }

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenCommandResult> {
    const decoded = await this.decodeToken(command.refreshToken);
    const {user, profile} = await this.getUserAndProfile(decoded.claims.id);
    await this.refreshSession(user.id, decoded.sessionKey, command.fingerprint);
    const result = await this.createToken(decoded.sessionKey, user, profile, command.fingerprint);
    return RefreshTokenCommandResult.new(result);
  }
}
