import {Database} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';

@Injectable()
export class DatabaseFakeAdapter extends Database {
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

  async exec(): Promise<Database.Result> {
    return {rowsAffected: 0};
  }

  async transaction<TType>(fn: (tx: Database.Transaction) => Promise<TType>): Promise<TType> {
    return fn(this);
  }
}
