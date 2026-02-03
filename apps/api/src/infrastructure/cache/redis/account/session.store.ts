import {Throws} from '#/application/_shared/decorator';
import {SessionStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import uuid from 'uuid';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisConfig} from '../redis.config';
import {CacheRedisError} from '../redis.error';

type Payload = {
  ip: string;
  userAgent: string;
  maxAge: Date;
};

@Throws(CacheRedisError)
@InjectableExisting(SessionStore)
export class CacheRedisSessionStore implements SessionStore {
  constructor(
    private readonly cacheRedisConfig: CacheRedisConfig,
    private readonly cacheRedisAdapter: CacheRedisAdapter
  ) {}

  async create(userId: string, ip: string, userAgent: string): Promise<string> {
    const sessionKey = uuid.v7();
    const key = `user:${userId}:session:${sessionKey}`;
    const payload = {
      ip,
      userAgent,
      maxAge: new Date(Date.now() + this.cacheRedisConfig.refreshTokenTTL * 1000),
    };
    await this.cacheRedisAdapter.set<Payload>(key, payload, this.cacheRedisConfig.refreshTokenTTL);
    return sessionKey;
  }

  async refresh(userId: string, sessionKey: string, ip: string, userAgent: string): Promise<void> {
    const {key, value} = await this.cacheRedisAdapter.get<Payload>(`user:${userId}:session:${sessionKey}`);
    if (value && value.ip === ip && value.userAgent === userAgent && new Date() < new Date(value.maxAge)) {
      return await this.cacheRedisAdapter.set<Payload>(key, value, this.cacheRedisConfig.refreshTokenTTL);
    }
    throw new CacheRedisError('Invalid session');
  }

  async revoke(userId: string, sessionKey: string): Promise<void> {
    await this.cacheRedisAdapter.delete(`user:${userId}:session:${sessionKey}`);
  }
}
