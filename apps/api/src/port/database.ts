// port/database.ts
import {Connectable} from '@/core/abstract';

// The main Client interface
export abstract class Database extends Connectable implements Database.Transaction {
  /**
   * Executes a SELECT query and returns multiple rows.
   * Equivalent to Go's Query().
   */
  abstract query<T = any>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * Executes a SELECT query and returns a single row (or null).
   * Equivalent to Go's QueryRow().
   */
  abstract queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;

  /**
   * Executes write commands (INSERT, UPDATE, DELETE).
   * Equivalent to Go's Exec().
   */
  abstract exec(sql: string, params?: any[]): Promise<Database.Result>;

  /**
   * Executes a function within a transaction.
   * The 'tx' received in the callback must be used to ensure atomicity.
   */
  abstract transaction<T>(fn: (tx: Database.Transaction) => Promise<T>): Promise<T>;

  /**
   * Closes the connection or the pool.
   */
  abstract close(): Promise<void>;
}
export namespace Database {
  export type Result = {
    rowsAffected: number;
    lastInsertId?: string | number | null;
  };
  export type Transaction = {
    /**
     * Executes a SELECT query and returns multiple rows.
     * Equivalent to Go's Query().
     */
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;

    /**
     * Executes a SELECT query and returns a single row (or null).
     * Equivalent to Go's QueryRow().
     */
    queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;

    /**
     * Executes write commands (INSERT, UPDATE, DELETE).
     * Equivalent to Go's Exec().
     */
    exec(sql: string, params?: any[]): Promise<Result>;
  };
}
