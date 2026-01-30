import {Broker} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {BrokerKafkaAdapter} from './kafka.adapter';
import {BrokerKafkaConfig} from './kafka.config';
import {BrokerKafkaLifecycle} from './kafka.lifecycle';

@Module({
  providers: [
    BrokerKafkaAdapter,
    BrokerKafkaConfig,
    BrokerKafkaLifecycle,
    {provide: Broker, useExisting: BrokerKafkaAdapter},
  ],
  exports: [Broker],
})
export class BrokerKafkaModule {}
