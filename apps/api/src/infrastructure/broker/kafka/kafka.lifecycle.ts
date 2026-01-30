import {Broker} from '#/domain/_shared/port';
import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';

@Injectable()
export class BrokerKafkaLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: Broker) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
