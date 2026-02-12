import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {CipherPort, OidcPort} from '#/domain/_shared/ports';
import {AccountUOW} from '#/domain/account';
import {KycEntity, ProfileEntity, UserEntity} from '#/domain/account/entities';
import {KycStatusEnum, SsoProviderEnum, UserRoleEnum, UserStatusEnum} from '#/domain/account/enums';
import {SsoInvalidOAuthCodeError, SsoInvalidStateError} from '#/domain/account/errors';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class SsoCallbackCommand extends createClass(
  Command,
  z.object({
    provider: z.enum(Object.values(SsoProviderEnum)).meta({
      description: 'OAuth2 provider',
      example: SsoProviderEnum.GOOGLE,
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
    private readonly accountUOW: AccountUOW,
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
    return await this.accountUOW.transaction(async session => {
      const oldUser = await session.user.findByEmail(claims.email);

      if (oldUser) {
        return oldUser;
      }

      const newUser = UserEntity.new({
        email: claims.email,
        passwordHash: '', // no need password when login using SSO
        status: UserStatusEnum.ACTIVE,
        role: UserRoleEnum.USER,
      });

      const newProfile = ProfileEntity.new({
        userId: newUser.id,
        name: `${claims.givenName} ${claims.familyName}`.trim(),
        phone: null,
        birthdate: null,
        twoFactorEnabled: false,
        language: 'en',
        timezone: 'UTC',
      });

      const newKyc = KycEntity.new({
        userId: newUser.id,
        status: KycStatusEnum.NONE,
        verifiedAt: null,
        level: '1',
      });

      await session.user.create(newUser);
      await session.profile.create(newProfile);
      await session.kyc.create(newKyc);

      return newUser;
    });
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
