import {DomainEvent} from '#/domain/_shared/event';
import {BrokerPort} from '#/domain/_shared/port';
import * as accountEvent from '#/domain/account/event';
import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';
import {EventBus} from '@nestjs/cqrs';

const eventMap = {...accountEvent};

@Injectable()
export class BrokerSubscriber implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly broker: BrokerPort,
    private readonly eventBus: EventBus
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.broker.subscribe(...Object.keys(eventMap));
    void this.broker.consume<any>(({name, payload, occurredAt, correlationId}: DomainEvent<any>) => {
      const EventClass = eventMap[name as keyof typeof eventMap];
      if (EventClass) {
        const event = Object.assign(new EventClass(), {payload, correlationId, occurredAt, name});
        this.eventBus.publish(event);
      }
    });
  }

  async onApplicationShutdown(): Promise<void> {
    void this.broker.close();
  }
}
