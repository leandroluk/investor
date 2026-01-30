import {Oidc} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {OidcAxiosResolver} from './axios.adapter';
import {OidcAxiosConfig} from './axios.config';

@Module({
  providers: [
    OidcAxiosConfig, //
    OidcAxiosResolver,
    {provide: Oidc, useExisting: OidcAxiosResolver},
  ],
  exports: [Oidc],
})
export class OidcAxiosModule {}
