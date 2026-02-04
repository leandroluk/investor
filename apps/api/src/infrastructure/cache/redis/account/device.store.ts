import {Throws} from '#/application/_shared/decorator';
import {DeviceStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(DeviceStore)
export class CacheRedisDeviceStore implements DeviceStore {
  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  async save(userId: string, fingerprint: string): Promise<void> {
    await this.cacheRedisAdapter.set(`user:${userId}:device:${fingerprint}`, '1');
  }

  async has(userId: string, fingerprint: string): Promise<boolean> {
    const result = await this.cacheRedisAdapter.exists(`user:${userId}:device:${fingerprint}`);
    return result;
  }

  async delete(userId: string, fingerprint: string): Promise<void> {
    await this.cacheRedisAdapter.delete(`user:${userId}:device:${fingerprint}`);
  }
}
