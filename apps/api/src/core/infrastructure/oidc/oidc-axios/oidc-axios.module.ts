import {OidcResolver} from '#/core/port/oidc';
import {Module} from '@nestjs/common';
import {OidcAxiosGoogleAdapter} from './oidc-axios-google.adapter';
import {OidcAxiosMicrosoftAdapter} from './oidc-axios-microsoft.adapter';
import {OidcAxiosConfig} from './oidc-axios.config';
import {OidcAxiosResolver} from './oidc-axios.resolver';

@Module({
  providers: [
    OidcAxiosGoogleAdapter,
    OidcAxiosMicrosoftAdapter,
    OidcAxiosConfig,
    OidcAxiosResolver,
    {provide: OidcResolver, useExisting: OidcAxiosResolver},
  ],
  exports: [OidcResolver],
})
export class OidcAxiosModule {}
