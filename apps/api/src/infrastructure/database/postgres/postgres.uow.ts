import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {type DomainUOW} from '#/domain/_shared/uow';
import {DatabasePostgresError} from './postgres.error';

type Session<TDomain extends DomainUOW<any>> = Parameters<Parameters<TDomain['transaction']>[0]>[0];

@Throws(DatabasePostgresError)
export abstract class DatabasePostgresUOW<TDomain extends DomainUOW<any>> implements DomainUOW<Session<TDomain>> {
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
