import {DomainEvent} from '#/domain/_shared/event';
import {BrokerPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(BrokerPort)
export class BrokerFakeAdapter extends BrokerPort {
  async ping(): Promise<void> {
    return;
  }
  async connect(): Promise<void> {
    return;
  }
  async close(): Promise<void> {
    return;
  }

  async publish<TPayload extends object = any>(event: DomainEvent<TPayload>): Promise<void> {
    console.log(`[Fake Broker] Published to ${event.constructor.name}:`, event.payload);
  }

  async subscribe(..._topics: string[]): Promise<void> {
    return;
  }
  async consume<TPayload extends object = any>(_handler: (event: DomainEvent<TPayload>) => void): Promise<void> {
    return;
  }
}
