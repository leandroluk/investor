import {Cache} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CacheFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [CacheFakeAdapter],
  exports: [Cache],
})
export class CacheFakeModule {}
