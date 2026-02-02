import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';
import {BrokerKafkaAdapter} from './kafka.adapter';

@Injectable()
export class BrokerKafkaLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: BrokerKafkaAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
