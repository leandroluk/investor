import {StoragePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {StorageFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [StorageFakeAdapter],
  exports: [StoragePort],
})
export class StorageFakeModule {}
