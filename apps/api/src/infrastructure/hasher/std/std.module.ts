import {HasherPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {HasherStdAdapter} from './std.adapter';

@EnhancedModule({
  providers: [HasherStdAdapter],
  exports: [HasherPort],
})
export class HasherStdModule {}
