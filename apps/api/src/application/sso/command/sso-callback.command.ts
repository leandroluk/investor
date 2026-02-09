import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {CipherPort, OidcPort} from '#/domain/_shared/ports';
import {UserEntity} from '#/domain/account/entities';
import {KycStatusEnum, SsoProviderEnum, UserStatusEnum} from '#/domain/account/enums';
import {SsoInvalidOAuthCodeError, SsoInvalidStateError} from '#/domain/account/errors';
import {UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class SsoCallbackCommand extends createClass(
  Command,
  z.object({
    provider: z.enum(Object.values(SsoProviderEnum)).meta({
      description: 'OAuth2 provider',
      example: 'google',
      enum: Object.values(SsoProviderEnum),
    }),
    code: z.string().min(1).meta({
      description: 'Authorization code from provider',
      example: 'abc123...',
    }),
    state: z.string().min(1).meta({
      description: 'Encrypted state with callback_url',
      example: 'eyJ...',
    }),
  })
) {}

@CommandHandler(SsoCallbackCommand)
export class SsoCallbackHandler implements ICommandHandler<SsoCallbackCommand, string> {
  private readonly addOneMinute = 60 * 1000;

  constructor(
    private readonly oidcPort: OidcPort,
    private readonly userRepository: UserRepository,
    private readonly cipherPort: CipherPort
  ) {}

  private decryptState(encodedState: string): OidcPort.State {
    try {
      const result = this.oidcPort.decodeState(encodedState);
      return result;
    } catch {
      throw new SsoInvalidStateError();
    }
  }

  private async exchangeCode(adapter: OidcPort.Adapter, code: string): Promise<OidcPort.Tokens> {
    try {
      const result = await adapter.exchange(code);
      return result;
    } catch {
      throw new SsoInvalidOAuthCodeError();
    }
  }

  private async upsertUser(claims: OidcPort.Claims): Promise<UserEntity> {
    const oldUser = await this.userRepository.findByEmail(claims.email);

    if (oldUser) {
      return oldUser;
    }

    const newUser: UserEntity = {
      id: crypto.randomUUID() as UserEntity['id'],
      email: claims.email,
      name: `${claims.givenName} ${claims.familyName}`.trim(),
      passwordHash: '', // no need password when login using SSO
      status: UserStatusEnum.ACTIVE,
      walletAddress: null,
      walletVerifiedAt: null,
      walletSeedEncrypted: null,
      kycStatus: KycStatusEnum.NONE,
      kycVerifiedAt: null,
      twoFactorEnabled: false,
      language: 'en',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    await this.userRepository.create(newUser);
    return newUser;
  }

  private async generateToken(provider: SsoProviderEnum, userId: UserEntity['id']): Promise<string> {
    const payload = {provider, userId, exp: Date.now() + this.addOneMinute};
    const result = this.cipherPort.encrypt(payload);
    return result;
  }

  async execute(command: SsoCallbackCommand): Promise<string> {
    const state = this.decryptState(command.state);
    const adapter = this.oidcPort.getAdapter(command.provider);
    const tokens = await this.exchangeCode(adapter, command.code);
    const claims = await adapter.getInfo(tokens.accessToken);
    const user = await this.upsertUser(claims);
    const token = await this.generateToken(command.provider, user.id);

    const callbackURL = new URL(state.callbackURL);
    callbackURL.searchParams.set('token', token);

    return callbackURL.toString();
  }
}
