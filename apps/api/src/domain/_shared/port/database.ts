export abstract class Database {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
  abstract exec(sql: string, params?: any[]): Promise<Database.Result>;
}
export namespace Database {
  export type Result = {
    rowsAffected: number;
    lastInsertId?: string | number | null;
  };
  export type Transaction = {
    query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
    exec(sql: string, params?: any[]): Promise<Result>;
  };
}
