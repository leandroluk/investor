import {Broker} from '#/core/port/broker';
import {Module} from '@nestjs/common';
import {BrokerKafkaAdapter} from './broker-kafka.adapter';
import {BrokerKafkaConfig} from './broker-kafka.config';
import {BrokerKafkaLifecycle} from './broker-kafka.lifecycle';

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
