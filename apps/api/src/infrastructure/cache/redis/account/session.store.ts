import {Throws} from '#/application/_shared/decorators';
import {DeviceEntity, UserEntity} from '#/domain/account/entities';
import {SessionStore} from '#/domain/account/stores';
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

  private key(key: string, userId: UserEntity['id'], deviceFingerprint: DeviceEntity['fingerprint']): string {
    return `session:${key}:userId:${userId}:deviceFingerprint:${deviceFingerprint}`;
  }

  async create(userId: UserEntity['id'], deviceFingerprint: DeviceEntity['fingerprint']): Promise<string> {
    const sessionKey = uuid.v7();
    const value = new Date(Date.now() + this.cacheRedisConfig.refreshTokenTTL * 1000).getTime();
    // delete any existing session for this fingerprint
    await this.cacheRedisAdapter.delete(this.key('*', userId, deviceFingerprint));
    // create specific session
    const key = this.key(sessionKey, userId, deviceFingerprint);
    await this.cacheRedisAdapter.set<number>(key, value, this.cacheRedisConfig.refreshTokenTTL);
    return sessionKey;
  }

  async refresh(
    sessionKey: string,
    userId: UserEntity['id'],
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void> {
    const {key, value} = await this.cacheRedisAdapter.get<number>(this.key(sessionKey, userId, deviceFingerprint));
    if (value && new Date() < new Date(value)) {
      const result = await this.cacheRedisAdapter.set<number>(key, value, this.cacheRedisConfig.refreshTokenTTL);
      return result;
    }
    throw new CacheRedisError('Invalid session');
  }

  async revoke(
    sessionKey: string,
    userId: UserEntity['id'],
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void> {
    await this.cacheRedisAdapter.delete(this.key(sessionKey, userId, deviceFingerprint));
  }
}
