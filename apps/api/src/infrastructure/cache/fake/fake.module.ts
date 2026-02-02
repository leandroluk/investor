import {CachePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CacheFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [CacheFakeAdapter],
  exports: [CachePort],
})
export class CacheFakeModule {}
