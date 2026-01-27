// infrastructure/cache/redis/resolver.ts

import {Resolver} from '@/core/di';
import {type Cache} from '@/port';
import z from 'zod';
import {CacheRedisAdapter} from './adapter';

export class CacheRedisResolver extends Resolver<Cache> {
  private readonly schema = z.object({
    url: z.url().default('redis://localhost:6379'),
    ttl: z.coerce.number().min(1).default(900),
  });

  async resolve(): Promise<Cache> {
    const config = await this.schema.parseAsync({
      url: process.env.API_CACHE_REDIS_URL ?? 'redis://localhost:6379',
      ttl: Number(process.env.API_CACHE_REDIS_TTL) || 900,
    });
    const adapter = new CacheRedisAdapter(config);
    await adapter.connect();
    return adapter;
  }
}
