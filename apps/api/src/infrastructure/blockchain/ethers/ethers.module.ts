import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BlockchainEthersAdapter} from './ethers.adapter';
import {BlockchainEthersConfig} from './ethers.config';
import {BlockchainEthersLifecycle} from './ethers.lifecycle';

const providers = [BlockchainEthersAdapter, BlockchainEthersConfig, BlockchainEthersLifecycle];

@EnhancedModule({providers, exports: providers})
export class BlockchainEthersModule {}
