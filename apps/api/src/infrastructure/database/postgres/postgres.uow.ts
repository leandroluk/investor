import {Throws} from '#/application/_shared/decorator';
import {type DomainUOW} from '#/domain/_shared/uow';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresError} from './postgres.error';

@Throws(DatabasePostgresError)
export abstract class DatabasePostgresUOW<TSession extends object> implements DomainUOW<TSession> {
  constructor(
    private readonly database: DatabasePostgresAdapter,
    private readonly session: TSession
  ) {}

  async transaction<TResult = any>(handler: (session: TSession) => Promise<TResult>): Promise<TResult> {
    const session = await this.database.pool.connect();
    try {
      await session.query('BEGIN');
      const result = await handler(this.session);
      await session.query('COMMIT');
      return result;
    } catch (error) {
      await session.query('ROLLBACK');
      throw error;
    }
  }
}
