import {Cache} from '#/core/port/cache';
import {Module} from '@nestjs/common';
import {CacheRedisAdapter} from './cache-redis.adapter';
import {CacheRedisConfig} from './cache-redis.config';
import {CacheRedisLifecycle} from './cache-redis.lifecycle';

@Module({
  providers: [
    CacheRedisAdapter,
    CacheRedisConfig,
    CacheRedisLifecycle,
    {provide: Cache, useExisting: CacheRedisAdapter},
  ],
  exports: [Cache],
})
export class CacheRedisModule {}
