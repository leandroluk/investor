import {Throws} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(DeviceStore)
export class CacheRedisDeviceStore implements DeviceStore {
  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  private key(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): string {
    return `device:userId:${userId}:fingerprint:${fingerprint}`;
  }

  async save(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void> {
    await this.cacheRedisAdapter.set(this.key(userId, fingerprint), '1');
  }

  async has(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<boolean> {
    const result = await this.cacheRedisAdapter.exists(this.key(userId, fingerprint));
    return result;
  }

  async delete(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void> {
    await this.cacheRedisAdapter.delete(this.key(userId, fingerprint));
  }
}
