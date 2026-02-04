import {Throws} from '#/application/_shared/decorator';
import {DeviceEntity, UserEntity} from '#/domain/account/entity';
import {SessionStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import uuid from 'uuid';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisConfig} from '../redis.config';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(SessionStore)
export class CacheRedisSessionStore implements SessionStore {
  constructor(
    private readonly cacheRedisConfig: CacheRedisConfig,
    private readonly cacheRedisAdapter: CacheRedisAdapter
  ) {}

  async create(user: UserEntity, device: DeviceEntity): Promise<string> {
    const sessionKey = uuid.v7();
    const key = `user:${user.id}:session:${sessionKey}:device:fingerprint:${device.fingerprint}`;
    const value = new Date(Date.now() + this.cacheRedisConfig.refreshTokenTTL * 1000).getTime();
    await this.cacheRedisAdapter.set<number>(key, value, this.cacheRedisConfig.refreshTokenTTL);
    return sessionKey;
  }

  async refresh(
    userId: UserEntity['id'],
    sessionKey: string,
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void> {
    const {key, value} = await this.cacheRedisAdapter.get<number>(
      `user:${userId}:session:${sessionKey}:device:fingerprint:${deviceFingerprint}`
    );
    if (value && new Date() < new Date(value)) {
      const result = await this.cacheRedisAdapter.set<number>(key, value, this.cacheRedisConfig.refreshTokenTTL);
      return result;
    }
    throw new CacheRedisError('Invalid session');
  }

  async revoke(userId: string, sessionKey: string): Promise<void> {
    await this.cacheRedisAdapter.delete(`user:${userId}:session:${sessionKey}:*`);
  }
}
