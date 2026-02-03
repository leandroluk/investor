import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';
import {CacheRedisAdapter} from './redis.adapter';

@Injectable()
export class CacheRedisLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly cacheRedisAdapter: CacheRedisAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.cacheRedisAdapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.cacheRedisAdapter.close();
  }
}
