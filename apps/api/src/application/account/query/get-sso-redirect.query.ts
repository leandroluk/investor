import {Query} from '#/application/_shared/bus';
import {OidcPort} from '#/domain/_shared/port';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const querySchema = z.object({
  provider: z.enum(['google', 'microsoft']),
  callbackUrl: z.string().url(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class GetSsoRedirectQuery extends Query<QuerySchema> {
  @ApiProperty({description: 'OAuth2 provider', example: 'google', enum: ['google', 'microsoft']})
  readonly provider!: 'google' | 'microsoft';

  @ApiProperty({description: 'Callback URL after authentication', example: 'https://app.com/auth/callback'})
  readonly callbackUrl!: string;

  constructor(payload: GetSsoRedirectQuery) {
    super(payload, querySchema);
  }
}

export interface GetSsoRedirectQueryResult {
  redirectUrl: string;
}

@QueryHandler(GetSsoRedirectQuery)
export class GetSsoRedirectQueryHandler implements IQueryHandler<GetSsoRedirectQuery, GetSsoRedirectQueryResult> {
  constructor(private readonly oidcPort: OidcPort) {}

  async execute(query: GetSsoRedirectQuery): Promise<GetSsoRedirectQueryResult> {
    const state: OidcPort.State = {callbackURL: query.callbackUrl, provider: query.provider};
    const encodedState = this.oidcPort.encodeState(state);
    const adapter = this.oidcPort.getAdapter(query.provider);
    const redirectUrl = adapter.getAuthURL(encodedState);

    return {redirectUrl};
  }
}
