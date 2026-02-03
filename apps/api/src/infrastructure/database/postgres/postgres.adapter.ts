import {Retry, Throws, Trace} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
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
  async exec(sql: string, params?: any[]): Promise<DatabasePort.Result> {
    const res = await this.pool.query(sql, params);
    return {
      rowsAffected: res.rowCount || 0,
      lastInsertId: res.rows[0]?.id || null,
    };
  }
}
