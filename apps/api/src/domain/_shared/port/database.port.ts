export abstract class DatabasePort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
  abstract exec(sql: string, params?: any[]): Promise<DatabasePort.Result>;
  abstract transaction<TResult = any>(handler: (tx: DatabasePort.Transaction) => Promise<TResult>): Promise<TResult>;
}
export namespace DatabasePort {
  export interface Result {
    rowsAffected: number;
    lastInsertId?: string | number | null;
  }
  export interface Transaction {
    query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
    exec(sql: string, params?: any[]): Promise<Result>;
  }
}
