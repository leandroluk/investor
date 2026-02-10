import {Throws} from '#/application/_shared/decorators';
import {UserEntity} from '#/domain/account/entities';
import {OtpStore} from '#/domain/account/stores';
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

  private key(userId: UserEntity['id'], code: string): string {
    return `otp:userId:${userId}:code:${code}`;
  }

  async create(userId: UserEntity['id']): Promise<string> {
    await this.cacheRedisAdapter.delete(this.key(userId, '*'));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheRedisAdapter.set(this.key(userId, otp), 1, this.cacheRedisConfig.otpTokenTTL);
    return otp;
  }

  async verify(otp: string): Promise<UserEntity['id']> {
    const {key} = await this.cacheRedisAdapter.get(this.key('*', otp));
    if (key.includes(`:code:${otp}`)) {
      await this.cacheRedisAdapter.delete(key);
      return key.split(':')[2]!;
    }
    throw new CacheRedisError('Invalid OTP');
  }
}
