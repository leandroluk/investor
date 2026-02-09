import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {OidcPort} from '#/domain/_shared/ports';
import {SsoProviderEnum} from '#/domain/account/enums';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class GetSsoRedirectQuery extends createClass(
  Query,
  z.object({
    provider: z.enum(Object.values(SsoProviderEnum)).meta({
      description: 'OAuth2 provider',
      example: 'google',
      enum: Object.values(SsoProviderEnum),
    }),
    callbackURL: z.url().meta({
      description: 'Callback URL after authentication',
      example: 'https://app.com/auth/callback',
    }),
  })
) {}

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
