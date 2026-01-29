import {type IConnectable} from '../interface/connectable.interface';

export abstract class Cache implements IConnectable {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract set<TType = any>(key: string, value: TType, ttl?: number): Promise<void>;
  abstract get<TType = any>(match: string): Promise<TType | null>;
  abstract delete(...matches: string[]): Promise<void>;
  abstract exists(...matches: string[]): Promise<number>;
  abstract expire(key: string, ttl: number): Promise<void>;
  abstract increment(key: string): Promise<number>;
  abstract decrement(key: string): Promise<number>;
  abstract acquire(key: string, ttl: number): Promise<void>;
  abstract release(key: string): Promise<void>;
}
