import {Throws} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';
import {ChallengeStore} from '#/domain/account/store';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {CacheRedisAdapter} from '../redis.adapter';
import {CacheRedisError} from '../redis.error';

@Throws(CacheRedisError)
@InjectableExisting(ChallengeStore)
export class CacheRedisChallengeStore implements ChallengeStore {
  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  async create(userId: UserEntity['id']): Promise<{challengeId: string; code: string}> {
    await this.cacheRedisAdapter.delete(`user:${userId}:challenge:*`);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const challengeId = crypto.randomUUID();
    const key = `user:${userId}:challenge:${challengeId}`;
    await this.cacheRedisAdapter.set(key, code, 60 * 15);
    return {challengeId, code};
  }

  async verify(challengeId: string, code: string): Promise<UserEntity['id']> {
    const {key, value} = await this.cacheRedisAdapter.get(`user:*:challenge:${challengeId}`);
    if (code === value) {
      await this.cacheRedisAdapter.delete(key);
      return key.split(':')[1]!;
    }
    throw new CacheRedisError('Invalid challenge code');
  }
}
