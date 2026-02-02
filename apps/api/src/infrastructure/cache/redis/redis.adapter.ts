import {Retry, Throws, Trace} from '#/application/_shared/decorator';
import {CachePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import Redis from 'ioredis';
import {CacheRedisConfig} from './redis.config';
import {CacheRedisError} from './redis.error';

@Throws(CacheRedisError)
@InjectableExisting(CachePort)
export class CacheRedisAdapter implements CachePort {
  private readonly redis: Redis;

  constructor(private readonly config: CacheRedisConfig) {
    this.redis = new Redis(this.config.url, {lazyConnect: true});
  }

  async ping(): Promise<void> {
    await this.redis.ping();
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }

  @Trace()
  @Retry({attempts: 2, delay: 200})
  async set<TType = any>(key: string, value: TType, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    let multi = this.redis.multi().set(key, stringValue);
    if (ttl) {
      multi = multi.expire(key, ttl);
    }
    await multi.exec();
  }

  @Trace()
  async get<TType = any>(pattern: string): Promise<{key: string; value: TType | null}> {
    try {
      let targetKey: string | undefined = pattern;

      if (pattern.includes('*')) {
        const [, keys] = await this.redis.scan(0, 'MATCH', pattern, 'COUNT', 1);
        targetKey = keys[0];
      }

      if (!targetKey) {
        return {key: '', value: null};
      }

      const value = await this.redis.get(targetKey);
      return {key: targetKey, value: value ? JSON.parse(value) : null};
    } catch {
      return {key: '', value: null};
    }
  }

  async delete(...keys: string[]): Promise<void> {
    await this.redis.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return await this.redis.exists(...keys);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }

  async increment(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return await this.redis.decr(key);
  }

  async acquire(key: string, ttl: number): Promise<void> {
    await this.redis.multi().setnx(key, '1').expire(key, ttl).exec();
  }
  async release(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
