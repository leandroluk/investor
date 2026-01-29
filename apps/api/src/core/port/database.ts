import {type IConnectable} from '../interface/connectable.interface';

export type DatabaseResult = {
  rowsAffected: number;
  lastInsertId?: string | number | null;
};

export type DatabaseTransaction = {
  query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
  queryOne<TType = any>(sql: string, params?: any[]): Promise<TType | null>;
  exec(sql: string, params?: any[]): Promise<DatabaseResult>;
};

export abstract class Database implements IConnectable, DatabaseTransaction {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
  abstract queryOne<TType = any>(sql: string, params?: any[]): Promise<TType | null>;
  abstract exec(sql: string, params?: any[]): Promise<DatabaseResult>;
  abstract transaction<TType>(fn: (tx: DatabaseTransaction) => Promise<TType>): Promise<TType>;
}
