import {DomainEvent} from '#/domain/_shared/events';
import {BrokerPort} from '#/domain/_shared/ports';
import * as accountEvent from '#/domain/account/events';
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
    void this.broker.consume<any>((domainEvent: DomainEvent<any>) => {
      const EventClass = eventMap[domainEvent.name as keyof typeof eventMap];
      if (EventClass) {
        this.eventBus.publish(
          new EventClass(
            domainEvent.correlationId, //
            domainEvent.occurredAt,
            domainEvent.payload,
            domainEvent.name
          )
        );
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    void this.broker.close();
  }
}
