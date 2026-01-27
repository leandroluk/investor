// infrastructure/database/postgres/resolver.ts
import {Resolver} from '@/core/di';
import {type Database} from '@/port';
import z from 'zod';
import {DatabasePostgresAdapter} from './adapter';

export class DatabasePostgresResolver extends Resolver<Database> {
  private readonly schema = z.object({
    url: z.string().url(),
    maxConnections: z.number().min(1).default(10),
    idleTimeoutMillis: z.number().min(1).default(30000),
  });

  async resolve(): Promise<Database> {
    const config = await this.schema.parseAsync({
      url: process.env.API_DATABASE_POSTGRES_URL ?? 'postgres://localhost:5432',
      maxConnections: Number(process.env.API_DATABASE_POSTGRES_MAX_CONNECTIONS) || 10,
      idleTimeoutMillis: Number(process.env.API_DATABASE_POSTGRES_IDLE_TIMEOUT_MILLIS) || 30000,
    });
    return new DatabasePostgresAdapter(config);
  }
}
