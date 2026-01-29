import {type IConnectable} from '../interface/connectable.interface';

export type BrokerMessage<T extends object> = {
  key: string;
  kind: string;
  tz: Date;
  payload: T;
};

export abstract class Broker implements IConnectable {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract publish<TType extends object = any>(message: BrokerMessage<TType>): Promise<void>;
  abstract subscribe(...topics: string[]): Promise<void>;
  abstract consume<TType extends object = any>(handler: (message: BrokerMessage<TType>) => void): Promise<void>;
}
