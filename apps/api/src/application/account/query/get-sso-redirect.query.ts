import {Query} from '#/application/_shared/bus';
import {OidcPort} from '#/domain/_shared/port';
import {SsoProviderEnum} from '#/domain/account/enum/sso-provider.enum';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const querySchema = z.object({
  provider: z.enum(['google', 'microsoft']),
  callbackURL: z.string().url(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class GetSsoRedirectQuery extends Query<QuerySchema> {
  @ApiProperty({
    description: 'OAuth2 provider',
    example: 'google',
    enum: Object.values(SsoProviderEnum),
  })
  readonly provider!: SsoProviderEnum;

  @ApiProperty({
    description: 'Callback URL after authentication',
    example: 'https://app.com/auth/callback',
  })
  readonly callbackURL!: string;

  constructor(payload: GetSsoRedirectQuery) {
    super(payload, querySchema);
  }
}

@QueryHandler(GetSsoRedirectQuery)
export class GetSsoRedirectQueryHandler implements IQueryHandler<GetSsoRedirectQuery, string> {
  constructor(private readonly oidcPort: OidcPort) {}

  async execute(query: GetSsoRedirectQuery): Promise<string> {
    const state: OidcPort.State = {callbackURL: query.callbackURL, provider: query.provider};
    const encodedState = this.oidcPort.encodeState(state);
    const adapter = this.oidcPort.getAdapter(query.provider);
    const redirectUrl = adapter.getAuthURL(encodedState);

    return redirectUrl;
  }
}
