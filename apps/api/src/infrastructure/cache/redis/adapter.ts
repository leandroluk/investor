// infrastructure/cache/redis/adapter.ts
import {canThrow} from '@/core/decorator';
import {Cache} from '@/port';
import Redis from 'ioredis';
import {CacheRedisError} from './error';

export interface CacheRedisAdapterConfig {
  readonly url: string;
  readonly ttl: number;
}

export class CacheRedisAdapter implements Cache {
  private client: Redis;
  private defaultTtlMs: number;

  constructor(config: CacheRedisAdapterConfig) {
    this.client = new Redis(config.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    this.defaultTtlMs = config.ttl * 1000;
  }

  @canThrow(CacheRedisError)
  async set(key: string, value: string, ttl?: number): Promise<void> {
    const finalTtl = ttl ?? this.defaultTtlMs;
    await this.client.set(key, value, 'PX', finalTtl);
  }

  @canThrow(CacheRedisError)
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  @canThrow(CacheRedisError)
  async delete(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }
    await this.client.del(...keys);
  }

  @canThrow(CacheRedisError)
  async exists(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.client.exists(...keys);
  }

  @canThrow(CacheRedisError)
  async expire(key: string, ttl: number): Promise<void> {
    await this.client.pexpire(key, ttl);
  }

  @canThrow(CacheRedisError)
  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  @canThrow(CacheRedisError)
  async decrement(key: string): Promise<number> {
    return this.client.decr(key);
  }

  @canThrow(CacheRedisError)
  async connect(): Promise<void> {
    await this.client.connect();
  }

  @canThrow(CacheRedisError)
  async close(): Promise<void> {
    await this.client.quit();
  }

  @canThrow(CacheRedisError)
  async ping(): Promise<void> {
    await this.client.ping();
  }
}
