import {Retry, Throws, Trace} from '#/application/_shared/decorator';
import {Database} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Pool, PoolClient, types} from 'pg';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresError} from './postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Database)
export class DatabasePostgresAdapter implements Database {
  private readonly pool: Pool;

  constructor(private readonly config: DatabasePostgresConfig) {
    types.setTypeParser(20, val => parseInt(val, 10));

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
  async exec(sql: string, params?: any[]): Promise<Database.Result> {
    const res = await this.pool.query(sql, params);
    return {
      rowsAffected: res.rowCount || 0,
      lastInsertId: res.rows[0]?.id || null,
    };
  }

  async transaction<TType>(fn: (tx: Database.Transaction) => Promise<TType>): Promise<TType> {
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

  private createTransactionWrapper(client: PoolClient): Database.Transaction {
    return {
      query: async (sql, params) => (await client.query(sql, params)).rows,
      exec: async (sql, params): Promise<Database.Result> => {
        const res = await client.query(sql, params);
        return {rowsAffected: res.rowCount || 0, lastInsertId: res.rows[0]?.id || null};
      },
    };
  }
}
