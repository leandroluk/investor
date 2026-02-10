import {Throws} from '#/application/_shared/decorators';
import {DeviceEntity} from '#/domain/account/entities';
import {DeviceStore} from '#/domain/account/stores';
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

  async save(args: {
    userId: DeviceEntity['userId']; //
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void> {
    await this.cacheRedisAdapter.set(this.key(args.userId, args.deviceFingerprint), '1');
  }

  async has(args: {
    userId: DeviceEntity['userId']; //
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<boolean> {
    const result = await this.cacheRedisAdapter.exists(this.key(args.userId, args.deviceFingerprint));
    return result;
  }

  async delete(args: {
    userId: DeviceEntity['userId']; //
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void> {
    await this.cacheRedisAdapter.delete(this.key(args.userId, args.deviceFingerprint));
  }
}
