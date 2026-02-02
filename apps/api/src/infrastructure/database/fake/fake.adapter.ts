import {DatabasePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(DatabasePort)
export class DatabaseFakeAdapter extends DatabasePort {
  async ping(): Promise<void> {
    return;
  }

  async connect(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    return;
  }

  async query<TType = any>(): Promise<TType[]> {
    return [];
  }

  async queryOne<TType = any>(): Promise<TType | null> {
    return null;
  }

  async exec(): Promise<DatabasePort.Result> {
    return {rowsAffected: 0};
  }

  async transaction<TType>(fn: (tx: DatabasePort.Transaction) => Promise<TType>): Promise<TType> {
    return fn(this);
  }
}
