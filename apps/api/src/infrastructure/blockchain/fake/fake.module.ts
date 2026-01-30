import {Blockchain} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BlockchainFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [BlockchainFakeAdapter],
  exports: [Blockchain],
})
export class BlockchainFakeModule {}
