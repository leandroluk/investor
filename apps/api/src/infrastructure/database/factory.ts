// infrastructure/database/factory.ts
import {factory, Factory} from '@/core/di';
import {Database} from '@/port';
import {DatabasePostgresResolver} from './postgres';

export enum DatabaseProvider {
  POSTGRES = 'postgres',
}

@factory(Database, (process.env.API_DATABASE_PROVIDER ?? DatabaseProvider.POSTGRES) as DatabaseProvider, {
  [DatabaseProvider.POSTGRES]: DatabasePostgresResolver,
})
export class DatabaseFactory extends Factory<Database, DatabaseProvider> {}
