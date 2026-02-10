import {Throws} from '#/application/_shared/decorators';
import {UserEntity} from '#/domain/account/entities';
import {NonceStore} from '#/domain/account/stores';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(NonceStore)
export class CacheRedisNonceStore implements NonceStore {
  private readonly TTL = 300; // 5 minutes

  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  private key(userId: UserEntity['id']): string {
    return `nonce:userId:${userId}`;
  }

  async save(args: {
    userId: UserEntity['id']; //
    nonce: string;
  }): Promise<void> {
    await this.cacheRedisAdapter.set(this.key(args.userId), args.nonce, this.TTL);
  }

  async get(userId: UserEntity['id']): Promise<string | null> {
    const {value} = await this.cacheRedisAdapter.get<string>(this.key(userId));
    return value;
  }

  async delete(userId: UserEntity['id']): Promise<void> {
    await this.cacheRedisAdapter.delete(this.key(userId));
  }
}
