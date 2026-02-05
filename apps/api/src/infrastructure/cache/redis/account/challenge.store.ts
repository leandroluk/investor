import {Throws} from '#/application/_shared/decorator';
import {ChallengeEntity} from '#/domain/account/entity';
import {ChallengeStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(ChallengeStore)
export class CacheRedisChallengeStore implements ChallengeStore {
  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  private key(userId: string): string {
    return `user.id:${userId}:challenge`;
  }

  async save(challenge: ChallengeEntity): Promise<void> {
    await this.cacheRedisAdapter.set(this.key(challenge.userId), {
      id: challenge.id,
      code: challenge.code,
      expiresAt: challenge.expiresAt,
    });
  }

  async get(userId: string): Promise<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'> | null> {
    const {value} = await this.cacheRedisAdapter.get(this.key(userId));
    return value ? value : null;
  }

  async delete(userId: string): Promise<void> {
    await this.cacheRedisAdapter.delete(this.key(userId));
  }
}
