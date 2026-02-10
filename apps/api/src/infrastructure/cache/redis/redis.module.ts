import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import * as accountStore from './account';
import {CacheRedisAdapter} from './redis.adapter';
import {CacheRedisConfig} from './redis.config';
import {CacheRedisLifecycle} from './redis.lifecycle';

const providers = [CacheRedisAdapter, CacheRedisConfig, CacheRedisLifecycle, ...Object.values(accountStore)];

@EnhancedModule({providers, exports: providers})
export class CacheRedisModule {}
