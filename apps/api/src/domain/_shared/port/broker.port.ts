import {type DomainEvent} from '../event';

export abstract class BrokerPort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract publish<TPayload extends object = any>(event: DomainEvent<TPayload>): Promise<void>;
  abstract subscribe(...topics: string[]): Promise<void>;
  abstract consume<TPayload extends object = any>(handler: (event: DomainEvent<TPayload>) => void): Promise<void>;
}
