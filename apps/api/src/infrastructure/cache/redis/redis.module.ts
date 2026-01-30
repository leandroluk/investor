import {Cache} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from './redis.adapter';
import {CacheRedisConfig} from './redis.config';
import {CacheRedisLifecycle} from './redis.lifecycle';

@EnhancedModule({
  providers: [CacheRedisAdapter, CacheRedisConfig, CacheRedisLifecycle],
  exports: [Cache],
})
export class CacheRedisModule {}
