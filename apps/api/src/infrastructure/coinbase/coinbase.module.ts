import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {CoinbaseAxiosModule} from './axios';

@Module({})
export class CoinbaseModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(CoinbaseModule, {
      envVar: 'API_COINBASE_PROVIDER',
      envSelectedProvider: 'axios',
      envProviderMap: {axios: CoinbaseAxiosModule},
      global: true,
    });
  }
}
