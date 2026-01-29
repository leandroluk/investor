import {DynamicModule, Module} from '@nestjs/common';
import {OidcAxiosModule} from './oidc-axios/oidc-axios.module';
import {OidcFakeModule} from './oidc-fake/oidc-fake.module';

@Module({})
export class OidcModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_LOGGER_PROVIDER || 'axios';

    const selectedModule = {
      axios: OidcAxiosModule,
      fake: OidcFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Oidc Provider: ${provider}`);
    }

    return {
      global: true,
      module: OidcModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
