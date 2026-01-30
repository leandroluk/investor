import {Oidc} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {OidcFakeAdapter} from './fake.adapter';
import {OidcFakeConfig} from './fake.config';

@Module({
  providers: [
    OidcFakeAdapter, //
    OidcFakeConfig,
    {provide: Oidc, useExisting: OidcFakeAdapter},
  ],
  exports: [Oidc],
})
export class OidcFakeModule {}
