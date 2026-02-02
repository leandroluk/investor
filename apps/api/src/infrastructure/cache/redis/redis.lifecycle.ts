import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';
import {CacheRedisAdapter} from './redis.adapter';

@Injectable()
export class CacheRedisLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: CacheRedisAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
