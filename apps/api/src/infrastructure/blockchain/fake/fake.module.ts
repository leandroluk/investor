import {BlockchainPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BlockchainFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [BlockchainFakeAdapter],
  exports: [BlockchainPort],
})
export class BlockchainFakeModule {}
