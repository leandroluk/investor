import {Storage} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {StorageFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [StorageFakeAdapter],
  exports: [Storage],
})
export class StorageFakeModule {}
