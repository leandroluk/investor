import {Database} from '#/core/port/database';
import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';

@Injectable()
export class DatabasePostgresLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: Database) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
