import {Injectable} from '@nestjs/common';
import ms from 'ms';
import z from 'zod';

@Injectable()
export class CacheRedisConfig {
  static readonly schema = z.object({
    url: z.url().default('redis://localhost:6379/0'),
    otpTokenTTL: z.coerce.number().default(ms('10m')),
    accessTokenTTL: z.coerce.number().default(ms('15m')),
    refreshTokenTTL: z.coerce.number().default(ms('1d')),
  });

  constructor() {
    Object.assign(
      this,
      CacheRedisConfig.schema.parse({
        url: process.env.API_CACHE_REDIS_URL,
        otpTokenTTL: process.env.API_CACHE_REDIS_OTP_TOKEN_TTL,
        accessTokenTTL: process.env.API_CACHE_REDIS_ACCESS_TOKEN_TTL,
        refreshTokenTTL: process.env.API_CACHE_REDIS_REFRESH_TOKEN_TTL,
      })
    );
  }

  readonly url!: string;
  readonly otpTokenTTL!: number;
  readonly accessTokenTTL!: number;
  readonly refreshTokenTTL!: number;
}
