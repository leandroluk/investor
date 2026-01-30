import {Database} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresLifecycle} from './postgres.lifecycle';

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
