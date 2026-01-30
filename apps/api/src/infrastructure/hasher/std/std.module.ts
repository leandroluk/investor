import {Hasher} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {HasherStdAdapter} from './std.adapter';

@EnhancedModule({
  providers: [HasherStdAdapter],
  exports: [Hasher],
})
export class HasherStdModule {}
