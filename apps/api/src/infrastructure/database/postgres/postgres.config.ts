import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class DatabasePostgresConfig {
  static readonly schema = z.object({
    url: z.url().default('postgresql://postgres:postgres@localhost:5432/database'),
    maxConnections: z.coerce.number().int().default(10),
    idleTimeoutMillis: z.coerce.number().int().default(30000),
  });

  constructor() {
    Object.assign(
      this,
      DatabasePostgresConfig.schema.parse({
        url: process.env.API_DATABASE_POSTGRES_URL,
        maxConnections: process.env.API_DATABASE_POSTGRES_MAX_CONNECTIONS,
        idleTimeoutMillis: process.env.API_DATABASE_POSTGRES_IDLE_TIMEOUT_MILLIS,
      })
    );
  }

  readonly url!: string;
  readonly maxConnections!: number;
  readonly idleTimeoutMillis!: number;
}
