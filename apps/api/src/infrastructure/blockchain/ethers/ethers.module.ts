import {Blockchain} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BlockchainEthersAdapter} from './ethers.adapter';
import {BlockchainEthersConfig} from './ethers.config';
import {BlockchainEthersLifecycle} from './ethers.lifecycle';

@EnhancedModule({
  providers: [BlockchainEthersAdapter, BlockchainEthersConfig, BlockchainEthersLifecycle],
  exports: [Blockchain],
})
export class BlockchainEthersModule {}
