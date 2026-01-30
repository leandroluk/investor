import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {BlockchainEthersModule} from './ethers';
import {BlockchainFakeModule} from './fake';

@Module({})
export class BlockchainModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(BlockchainModule, {
      envVar: 'API_BLOCKCHAIN_PROVIDER',
      envSelectedProvider: 'ethers',
      envProviderMap: {ethers: BlockchainEthersModule, fake: BlockchainFakeModule},
      global: true,
    });
  }
}
