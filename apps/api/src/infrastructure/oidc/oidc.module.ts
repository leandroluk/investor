import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {OidcAxiosModule} from './axios';
import {OidcFakeModule} from './fake';

@Module({})
export class OidcModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(OidcModule, {
      envVar: 'API_OIDC_PROVIDER',
      envSelectedProvider: 'axios',
      envProviderMap: {axios: OidcAxiosModule, fake: OidcFakeModule},
      global: true,
    });
  }
}
