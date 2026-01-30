import {DynamicModule, Module} from '@nestjs/common';
import {BlockchainEthersModule} from './ethers';
import {BlockchainFakeModule} from './fake';

@Module({})
export class BlockchainModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_BLOCKCHAIN_PROVIDER || 'ethers';

    const selectedModule = {
      ethers: BlockchainEthersModule,
      fake: BlockchainFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Blockchain Provider: ${provider}`);
    }

    return {
      global: true,
      module: BlockchainModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
