import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';
import {BrokerKafkaAdapter} from './kafka.adapter';

@Injectable()
export class BrokerKafkaLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly brokerKafkaAdapter: BrokerKafkaAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.brokerKafkaAdapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.brokerKafkaAdapter.close();
  }
}
