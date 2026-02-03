import {Throws} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';
import {OtpStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisConfig} from '../redis.config';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(OtpStore)
export class CacheRedisOtpStore implements OtpStore {
  constructor(
    private readonly cacheRedisConfig: CacheRedisConfig,
    private readonly cacheRedisAdapter: CacheRedisAdapter
  ) {}

  async create(userId: UserEntity['id']): Promise<string> {
    await this.cacheRedisAdapter.delete(`user:${userId}:otp:*`);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `user:${userId}:otp:${otp}`;
    await this.cacheRedisAdapter.set(key, otp, this.cacheRedisConfig.otpTokenTTL);
    return otp;
  }

  async verify(otp: string): Promise<UserEntity['id']> {
    const {key, value} = await this.cacheRedisAdapter.get(`user:*:otp:${otp}`);
    if (otp === value) {
      await this.cacheRedisAdapter.delete(key);
      return key.split(':')[1]!;
    }
    throw new CacheRedisError('Invalid OTP');
  }
}
