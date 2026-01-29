import {OidcAdapter, OidcResolver} from '#/core/port/oidc';
import {Injectable} from '@nestjs/common';
import {OidcAxiosGoogleAdapter} from './oidc-axios-google.adapter';
import {OidcAxiosMicrosoftAdapter} from './oidc-axios-microsoft.adapter';

@Injectable()
export class OidcAxiosResolver implements OidcResolver {
  constructor(
    private readonly googleAdapter: OidcAxiosGoogleAdapter,
    private readonly microsoftAdapter: OidcAxiosMicrosoftAdapter
  ) {}

  getAdapter(provider: 'microsoft' | 'google'): OidcAdapter {
    const adapter = {
      microsoft: this.microsoftAdapter,
      google: this.googleAdapter,
    }[provider];

    if (!adapter) {
      throw new Error(`Invalid provider: ${provider}`);
    }

    return adapter;
  }
}
