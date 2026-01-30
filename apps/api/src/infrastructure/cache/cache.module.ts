import {DynamicModule, Module} from '@nestjs/common';
import {CacheFakeModule} from './fake';
import {CacheRedisModule} from './redis';

@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_CACHE_PROVIDER || 'redis';

    const selectedModule = {
      redis: CacheRedisModule,
      fake: CacheFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Cache Provider: ${provider}`);
    }

    return {
      global: true,
      module: CacheModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
