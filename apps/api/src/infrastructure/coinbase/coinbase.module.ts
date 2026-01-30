import {DynamicModule, Module} from '@nestjs/common';
import {CoinbaseAxiosModule} from './axios';
import {CoinbaseFakeModule} from './fake';

@Module({})
export class CoinbaseModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_CIPHER_PROVIDER || 'axios';

    const selectedModule = {
      axios: CoinbaseAxiosModule,
      fake: CoinbaseFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Coinbase Provider: ${provider}`);
    }

    return {
      global: true,
      module: CoinbaseModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
