import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BlockchainFakeAdapter} from './fake.adapter';

const providers = [BlockchainFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class BlockchainFakeModule {}
