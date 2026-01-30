import {Throws} from '#/application/_shared/decorator';
import {type Database} from '#/domain/_shared/port';
import {type UnitOfWork} from '#/domain/_shared/unit-of-work';
import {DatabasePostgresError} from './postgres.error';

@Throws(DatabasePostgresError)
export abstract class DatabaseUnitOfWork<TSession extends object> implements UnitOfWork<TSession> {
  constructor(
    private readonly database: Database,
    private readonly session: TSession
  ) {}

  async transaction<TResult = any>(handler: (session: TSession) => Promise<TResult>): Promise<TResult> {
    try {
      await this.database.exec('BEGIN');
      const result = await handler(this.session);
      await this.database.exec('COMMIT');
      return result;
    } catch (error) {
      await this.database.exec('ROLLBACK');
      throw error;
    }
  }
}
