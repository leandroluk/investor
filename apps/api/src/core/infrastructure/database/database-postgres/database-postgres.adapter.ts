import {Retry} from '#/core/application/decorator/retry';
import {Throws} from '#/core/application/decorator/throws';
import {Trace} from '#/core/application/decorator/trace';
import {Database, DatabaseResult, DatabaseTransaction} from '#/core/port/database';
import {Injectable} from '@nestjs/common';
import {Pool, PoolClient} from 'pg';
import {DatabasePostgresConfig} from './database-postgres.config';
import {DatabasePostgresError} from './database-postgres.error';

@Throws(DatabasePostgresError)
@Injectable()
export class DatabasePostgresAdapter implements Database {
  private readonly pool: Pool;

  constructor(private readonly config: DatabasePostgresConfig) {
    this.pool = new Pool({
      connectionString: this.config.url,
      max: this.config.maxConnections,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
    });
  }

  async ping(): Promise<void> {
    await this.query('SELECT 1');
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  @Trace()
  @Retry({attempts: 2, delay: 200})
  async query<TType = any>(sql: string, params?: any[]): Promise<TType[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  @Trace()
  async queryOne<TType = any>(sql: string, params?: any[]): Promise<TType | null> {
    const rows = await this.query<TType>(sql, params);
    return rows[0] || null;
  }

  @Trace()
  async exec(sql: string, params?: any[]): Promise<DatabaseResult> {
    const res = await this.pool.query(sql, params);
    return {
      rowsAffected: res.rowCount || 0,
      lastInsertId: res.rows[0]?.id || null,
    };
  }

  async transaction<TType>(fn: (tx: DatabaseTransaction) => Promise<TType>): Promise<TType> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(this.createTransactionWrapper(client));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private createTransactionWrapper(client: PoolClient): DatabaseTransaction {
    return {
      query: async (sql, params) => (await client.query(sql, params)).rows,
      queryOne: async (sql, params) => (await client.query(sql, params)).rows[0] || null,
      exec: async (sql, params): Promise<DatabaseResult> => {
        const res = await client.query(sql, params);
        return {rowsAffected: res.rowCount || 0, lastInsertId: res.rows[0]?.id || null};
      },
    };
  }
}
