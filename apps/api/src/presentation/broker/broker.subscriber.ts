import {DomainEvent} from '#/domain/_shared/event';
import {BrokerPort} from '#/domain/_shared/port';
import * as accountEvent from '#/domain/account/event';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {EventBus} from '@nestjs/cqrs';

const eventMap = {...accountEvent};

@Injectable()
export class BrokerSubscriber implements OnModuleInit {
  constructor(
    private readonly broker: BrokerPort,
    private readonly eventBus: EventBus
  ) {}

  async onModuleInit(): Promise<void> {
    await this.broker.subscribe(...Object.keys(eventMap));
    await this.broker.consume<any>(({name, payload, occurredAt, correlationId}: DomainEvent<any>) => {
      const EventClass = eventMap[name as keyof typeof eventMap];
      if (EventClass) {
        const instance = Object.assign(Object.assign(new EventClass(), {payload, correlationId, occurredAt, name}));
        this.eventBus.publish(instance);
      }
    });
  }
}
