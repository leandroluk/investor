import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';
import {DatabasePostgresAdapter} from './postgres.adapter';

@Injectable()
export class DatabasePostgresLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: DatabasePostgresAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
