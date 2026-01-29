import {OidcResolver} from '#/core/port/oidc';
import {Module} from '@nestjs/common';
import {OidcFakeAdapter} from './oidc-fake.adapter';
import {OidcFakeResolver} from './oidc-fake.resolver';

@Module({
  providers: [
    OidcFakeAdapter, //
    OidcFakeResolver,
    {provide: OidcResolver, useExisting: OidcFakeResolver},
  ],
  exports: [OidcResolver],
})
export class OidcFakeModule {}
