import {Blockchain} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {BlockchainEthersAdapter} from './ethers.adapter';
import {BlockchainEthersConfig} from './ethers.config';
import {BlockchainEthersLifecycle} from './ethers.lifecycle';

@Module({
  providers: [
    BlockchainEthersAdapter,
    BlockchainEthersConfig,
    BlockchainEthersLifecycle,
    {provide: Blockchain, useExisting: BlockchainEthersAdapter},
  ],
  exports: [Blockchain],
})
export class BlockchainEthersModule {}
