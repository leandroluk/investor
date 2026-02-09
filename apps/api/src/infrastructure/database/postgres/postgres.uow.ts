import {Throws} from '#/application/_shared/decorators';
import {UOW} from '#/domain/_shared/classes';
import {DatabasePort} from '#/domain/_shared/ports';
import {DatabasePostgresError} from './postgres.error';

type Session<TDomain extends UOW<any>> = Parameters<Parameters<TDomain['transaction']>[0]>[0];

@Throws(DatabasePostgresError)
export abstract class DatabasePostgresUOW<TDomain extends UOW<any>> implements UOW<Session<TDomain>> {
  constructor(
    private readonly database: DatabasePort,
    private readonly createSession: (tx: DatabasePort.Transaction) => Session<TDomain>
  ) {}

  async transaction<TResult = any>(handler: (session: Session<TDomain>) => Promise<TResult>): Promise<TResult> {
    const result = await this.database.transaction(async tx => {
      const session = this.createSession(tx);
      return handler(session);
    });
    return result;
  }
}
