import {Throws} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';
import {OtpStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(OtpStore)
export class CacheRedisOtpStore implements OtpStore {
  constructor(private readonly adapter: CacheRedisAdapter) {}

  async create(userId: UserEntity['id']): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `user:${userId}:otp:${otp}`;
    await this.adapter.set(key, otp, 60 * 5);
    return otp;
  }

  async verify(otp: string): Promise<UserEntity['id']> {
    const {key, value} = await this.adapter.get(`user:*:otp:${otp}`);
    if (otp === value) {
      await this.adapter.delete(key);
      return key.split(':')[1]!;
    }
    throw new CacheRedisError('Invalid OTP');
  }
}
