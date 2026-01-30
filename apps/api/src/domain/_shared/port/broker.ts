export abstract class Broker {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract publish<TType extends object = any>(message: Broker.Message<TType>): Promise<void>;
  abstract subscribe(...topics: string[]): Promise<void>;
  abstract consume<TType extends object = any>(handler: (message: Broker.Message<TType>) => void): Promise<void>;
}
export namespace Broker {
  export type Message<T extends object> = {
    key: string;
    kind: string;
    tz: Date;
    payload: T;
  };
}
