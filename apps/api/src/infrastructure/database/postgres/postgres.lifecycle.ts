import {Injectable, type OnApplicationBootstrap, type OnApplicationShutdown} from '@nestjs/common';
import {DatabasePostgresAdapter} from './postgres.adapter';

@Injectable()
export class DatabasePostgresLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly databasePostgresAdapter: DatabasePostgresAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.databasePostgresAdapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.databasePostgresAdapter.close();
  }
}
