import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {BlockchainEthersModule} from './ethers';

@Module({})
export class BlockchainModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(BlockchainModule, {
      envVar: 'API_BLOCKCHAIN_PROVIDER',
      envSelectedProvider: 'ethers',
      envProviderMap: {ethers: BlockchainEthersModule},
      global: true,
    });
  }
}
