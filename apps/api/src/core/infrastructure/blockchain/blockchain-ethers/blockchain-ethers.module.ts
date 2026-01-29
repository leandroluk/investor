import {Blockchain} from '#/core/port/blockchain';
import {Module} from '@nestjs/common';
import {BlockchainEthersAdapter} from './blockchain-ethers.adapter';
import {BlockchainEthersConfig} from './blockchain-ethers.config';
import {BlockchainEthersLifecycle} from './blockchain-ethers.lifecycle';

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
