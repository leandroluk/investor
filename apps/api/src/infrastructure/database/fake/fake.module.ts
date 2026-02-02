import {DatabasePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {DatabaseFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [DatabaseFakeAdapter],
  exports: [DatabasePort],
})
export class DatabaseFakeModule {}
