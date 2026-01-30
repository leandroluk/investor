import {Broker} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(Broker)
export class BrokerFakeAdapter extends Broker {
  async ping(): Promise<void> {
    return;
  }
  async connect(): Promise<void> {
    return;
  }
  async close(): Promise<void> {
    return;
  }

  async publish<TType extends object = any>(message: Broker.Message<TType>): Promise<void> {
    console.log(`[Fake Broker] Published to ${message.kind}:`, message.payload);
  }

  async subscribe(..._topics: string[]): Promise<void> {
    return;
  }
  async consume<TType extends object = any>(_handler: (message: Broker.Message<TType>) => void): Promise<void> {
    return;
  }
}
