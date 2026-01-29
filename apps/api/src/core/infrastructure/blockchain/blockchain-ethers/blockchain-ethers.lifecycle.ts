import {Blockchain} from '#/core/port/blockchain';
import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';

@Injectable()
export class BlockchainEthersLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: Blockchain) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
