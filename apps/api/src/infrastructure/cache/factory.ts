// infrastructure/cache/factory.ts
import {factory, Factory} from '@/core/di';
import {Cache} from '@/port';
import {CacheRedisResolver} from './redis';

export enum CacheProvider {
  REDIS = 'redis',
}

@factory(Cache, (process.env.API_CACHE_PROVIDER ?? CacheProvider.REDIS) as CacheProvider, {
  [CacheProvider.REDIS]: CacheRedisResolver,
})
export class CacheFactory extends Factory<Cache, CacheProvider> {}
