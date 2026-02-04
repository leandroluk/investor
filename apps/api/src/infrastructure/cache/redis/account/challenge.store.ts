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

  async save(challenge: ChallengeEntity): Promise<void> {
    await this.cacheRedisAdapter.set(`user:${challenge.userId}:challenge`, {
      id: challenge.id,
      code: challenge.code,
      expiresAt: challenge.expiresAt,
    });
  }

  async get(userId: string): Promise<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'> | null> {
    const key = `user:${userId}:challenge`;
    const {value} = await this.cacheRedisAdapter.get<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'>>(key);
    return value ? value : null;
  }

  async delete(userId: string): Promise<void> {
    await this.cacheRedisAdapter.delete(`user:${userId}:challenge`);
  }
}
