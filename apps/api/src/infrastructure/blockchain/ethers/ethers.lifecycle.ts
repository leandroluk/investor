import {Injectable, OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common';
import {BlockchainEthersAdapter} from './ethers.adapter';

@Injectable()
export class BlockchainEthersLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly adapter: BlockchainEthersAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.adapter.close();
  }
}
