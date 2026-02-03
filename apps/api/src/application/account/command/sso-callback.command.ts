import {Command} from '#/application/_shared/bus';
import {BrokerPort, CipherPort, OidcPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {KycStatusEnum, UserStatusEnum} from '#/domain/account/enum';
import {SsoInvalidOAuthCodeError, SsoInvalidStateError} from '#/domain/account/error';
import {UserLoggedInEvent} from '#/domain/account/event';
import {UserRepository} from '#/domain/account/repository';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const commandSchema = z.object({
  provider: z.enum(['google', 'microsoft']),
  code: z.string().min(1),
  state: z.string().min(1),
});

type CommandSchema = z.infer<typeof commandSchema>;

export class SsoCallbackCommand extends Command<CommandSchema> {
  @ApiProperty({description: 'OAuth2 provider', example: 'google', enum: ['google', 'microsoft']})
  readonly provider!: 'google' | 'microsoft';

  @ApiProperty({description: 'Authorization code from provider', example: 'abc123...'})
  readonly code!: string;

  @ApiProperty({description: 'Encrypted state with callback_url', example: 'eyJ...'})
  readonly state!: string;

  constructor(payload: SsoCallbackCommand) {
    super(payload, commandSchema);
  }
}

export interface SsoCallbackCommandResult {
  redirectUrl: string;
}

@CommandHandler(SsoCallbackCommand)
export class SsoCallbackHandler implements ICommandHandler<SsoCallbackCommand, SsoCallbackCommandResult> {
  private readonly addOneMinute = 60 * 1000;

  constructor(
    private readonly oidcPort: OidcPort,
    private readonly userRepository: UserRepository,
    private readonly cipherPort: CipherPort,
    private readonly brokerPort: BrokerPort
  ) {}

  private decryptState(encodedState: string): OidcPort.State {
    try {
      return this.oidcPort.decodeState(encodedState);
    } catch {
      throw new SsoInvalidStateError();
    }
  }

  private async exchangeCode(adapter: OidcPort.Adapter, code: string): Promise<OidcPort.Tokens> {
    try {
      return await adapter.exchange(code);
    } catch {
      throw new SsoInvalidOAuthCodeError();
    }
  }

  private async upsertUser(claims: OidcPort.Claims): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(claims.email);

    if (existingUser) {
      return existingUser;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepository.create(newUser);
    return newUser;
  }

  private async generateLoginToken(provider: 'google' | 'microsoft', userId: UserEntity['id']): Promise<string> {
    const payload = {provider, userId, exp: Date.now() + this.addOneMinute};
    return await this.cipherPort.encrypt(JSON.stringify(payload));
  }

  async execute(command: SsoCallbackCommand): Promise<SsoCallbackCommandResult> {
    const state = this.decryptState(command.state);
    const adapter = this.oidcPort.getAdapter(command.provider);
    const tokens = await this.exchangeCode(adapter, command.code);
    const claims = await adapter.getInfo(tokens.accessToken);
    const user = await this.upsertUser(claims);
    const loginToken = await this.generateLoginToken(command.provider, user.id);

    await this.brokerPort.publish(
      new UserLoggedInEvent(command.correlationId, new Date(), {
        userId: user.id,
        provider: command.provider,
      })
    );

    const redirectUrl = new URL(state.callbackURL);
    redirectUrl.searchParams.set('token', loginToken);

    return {redirectUrl: redirectUrl.toString()};
  }
}
