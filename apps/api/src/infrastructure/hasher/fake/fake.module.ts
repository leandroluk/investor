import {Hasher} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {HasherFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [HasherFakeAdapter],
  exports: [Hasher],
})
export class HasherFakeModule {}
