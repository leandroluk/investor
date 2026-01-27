// port/cache.ts
import {Connectable} from '@/core/abstract';

export abstract class Cache extends Connectable {
  /**
   * Stores a value with an optional TTL (in milliseconds).
   * @param key The key to store.
   * @param value The string value to store.
   * @param ttl Optional Time-To-Live in milliseconds.
   */
  abstract set(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Retrieves a value.
   * Returns null if the key does not exist.
   * @param key The key to retrieve.
   */
  abstract get(key: string): Promise<string | null>;

  /**
   * Removes one or more keys.
   * @param keys The keys to remove.
   */
  abstract delete(...keys: string[]): Promise<void>;

  /**
   * Checks if keys exist.
   * Returns the count of existing keys.
   * @param keys The keys to check.
   */
  abstract exists(...keys: string[]): Promise<number>;

  /**
   * Defines TTL for an existing key.
   * @param key The key to update.
   * @param ttl Time-To-Live in milliseconds.
   */
  abstract expire(key: string, ttl: number): Promise<void>;

  /**
   * Increments an integer value.
   * Returns the new value.
   * @param key The key to increment.
   */
  abstract increment(key: string): Promise<number>;

  /**
   * Decrements an integer value.
   * Returns the new value.
   * @param key The key to decrement.
   */
  abstract decrement(key: string): Promise<number>;

  /**
   * Closes the connection.
   */
  abstract close(): Promise<void>;
}
