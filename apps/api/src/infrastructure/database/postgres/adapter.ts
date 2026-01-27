// infrastructure/database/postgres/adapter.ts
import {canThrow} from '@/core/decorator';
import {Database} from '@/port';
import {Pool, PoolClient} from 'pg';
import {DatabasePostgresError} from './error';

export interface DatabasePostgresAdapterConfig {
  readonly url: string;
  readonly maxConnections: number;
  readonly idleTimeoutMillis: number;
}

export class DatabasePostgresAdapter implements Database {
  private pool: Pool;

  constructor(config: DatabasePostgresAdapterConfig) {
    this.pool = new Pool({
      connectionString: config.url,
      max: config.maxConnections,
      idleTimeoutMillis: config.idleTimeoutMillis,
    });
  }

  private async runQuery<T>(executor: Pool | PoolClient, sql: string, params: any[] = []): Promise<T[]> {
    const result = await executor.query(sql, params);
    return result.rows;
  }

  @canThrow(DatabasePostgresError)
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return this.runQuery<T>(this.pool, sql, params);
  }

  @canThrow(DatabasePostgresError)
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.runQuery<T>(this.pool, sql, params);
    return rows.length > 0 ? (rows[0] as T) : null;
  }

  @canThrow(DatabasePostgresError)
  async exec(sql: string, params?: any[]): Promise<{rowsAffected: number}> {
    const result = await this.pool.query(sql, params);
    return {
      rowsAffected: result.rowCount ?? 0,
    };
  }
  @canThrow(DatabasePostgresError)
  async transaction<T>(fn: (tx: Database.Transaction) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txAdapter: Database.Transaction = {
        query: async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
          return await this.runQuery<T>(client, sql, params);
        },
        queryOne: async <T = any>(sql: string, params?: any[]): Promise<T | null> => {
          const rows = await this.runQuery<T>(client, sql, params);
          return rows.length > 0 ? (rows[0] as T) : null;
        },
        exec: async (sql: string, params?: any[]): Promise<Database.Result> => {
          const result = await client.query(sql, params);
          return {rowsAffected: result.rowCount ?? 0};
        },
      };
      const result = await fn(txAdapter);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  @canThrow(DatabasePostgresError)
  async connect(): Promise<void> {
    await this.pool.connect();
  }

  @canThrow(DatabasePostgresError)
  async ping(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  @canThrow(DatabasePostgresError)
  async close(): Promise<void> {
    await this.pool.end();
  }
}
