import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {CacheFakeModule} from './fake';
import {CacheRedisModule} from './redis';

@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(CacheModule, {
      envVar: 'API_CACHE_PROVIDER',
      envSelectedProvider: 'redis',
      envProviderMap: {redis: CacheRedisModule, fake: CacheFakeModule},
      global: true,
    });
  }
}
