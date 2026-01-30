import {DynamicModule, Module} from '@nestjs/common';
import {OidcAxiosModule} from './axios/axios.module';
import {OidcFakeModule} from './fake/fake.module';

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
