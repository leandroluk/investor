import {CipherPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CipherFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [CipherFakeAdapter],
  exports: [CipherPort],
})
export class CipherFakeModule {}
