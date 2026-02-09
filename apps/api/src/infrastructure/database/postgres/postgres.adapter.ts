import {Retry, Throws, Trace} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Pool, types} from 'pg';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresError} from './postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(DatabasePort)
export class DatabasePostgresAdapter implements DatabasePort {
  readonly pool: Pool;

  constructor(private readonly databasePostgresConfig: DatabasePostgresConfig) {
    types.setTypeParser(20, val => parseInt(val, 10));

    this.pool = new Pool({
      connectionString: this.databasePostgresConfig.url,
      max: this.databasePostgresConfig.maxConnections,
      idleTimeoutMillis: this.databasePostgresConfig.idleTimeoutMillis,
      connectionTimeoutMillis: 3000,
    });
  }

  async ping(): Promise<void> {
    await this.query('SELECT 1');
  }

  async connect(): Promise<void> {
    const connection = await this.pool.connect();
    connection.release();
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
  async exec(sql: string, params?: any[]): Promise<DatabasePort.Result> {
    const res = await this.pool.query(sql, params);
    return {
      rowsAffected: res.rowCount || 0,
      lastInsertId: res.rows[0]?.id || null,
    };
  }

  async transaction<TResult>(handler: (tx: DatabasePort.Transaction) => Promise<TResult>): Promise<TResult> {
    const client = await this.pool.connect();

    const tx: DatabasePort.Transaction = {
      query: async <TType = any>(sql: string, params?: any[]) => {
        const res = await client.query(sql, params);
        return res.rows as TType[];
      },
      exec: async (sql: string, params?: any[]) => {
        const res = await client.query(sql, params);
        return {
          rowsAffected: res.rowCount || 0,
          lastInsertId: res.rows[0]?.id || null,
        };
      },
    };

    try {
      await client.query('BEGIN');
      const result = await handler(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback error
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
