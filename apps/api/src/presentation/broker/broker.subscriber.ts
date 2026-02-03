import {DomainEvent} from '#/domain/_shared/event';
import {BrokerPort} from '#/domain/_shared/port';
import * as accountEvent from '#/domain/account/event';
import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {EventBus} from '@nestjs/cqrs';

const eventMap = {
  ...accountEvent, //
  // ...otherEvent
};

@Injectable()
export class BrokerSubscriber implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly broker: BrokerPort,
    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    await this.broker.subscribe(...Object.keys(eventMap));
    void this.broker.consume<any>(({constructor: {name}, payload, occurredAt, correlationId}: DomainEvent<any>) => {
      const EventClass = eventMap[name as keyof typeof eventMap];
      if (EventClass) {
        this.eventBus.publish(new EventClass(correlationId, occurredAt, payload, name));
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    void this.broker.close();
  }
}
