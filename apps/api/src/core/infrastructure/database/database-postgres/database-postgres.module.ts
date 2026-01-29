import {Database} from '#/core/port/database';
import {Module} from '@nestjs/common';
import {DatabasePostgresAdapter} from './database-postgres.adapter';
import {DatabasePostgresConfig} from './database-postgres.config';
import {DatabasePostgresLifecycle} from './database-postgres.lifecycle';

@Module({
  providers: [
    DatabasePostgresAdapter, //
    DatabasePostgresConfig,
    DatabasePostgresLifecycle,
    {provide: Database, useExisting: DatabasePostgresAdapter},
  ],
  exports: [Database],
})
export class DatabasePostgresModule {}
