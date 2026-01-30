import {Database} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {DatabaseFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [DatabaseFakeAdapter],
  exports: [Database],
})
export class DatabaseFakeModule {}
