import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class CacheRedisConfig {
  static readonly schema = z.object({
    url: z.url().default('redis://localhost:6379/0'),
  });

  constructor() {
    Object.assign(
      this,
      CacheRedisConfig.schema.parse({
        url: process.env.API_CACHE_REDIS_URL,
      })
    );
  }

  readonly url!: string;
}
