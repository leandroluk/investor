import {Cache} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CacheRedisAdapter} from './redis.adapter';
import {CacheRedisConfig} from './redis.config';
import {CacheRedisLifecycle} from './redis.lifecycle';

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
