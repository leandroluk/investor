import {Cache} from '#/core/port/cache';
import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';

@Injectable()
export class CacheRedisLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: Cache) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
