import {TokenPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TokenFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [TokenFakeAdapter],
  exports: [TokenPort],
})
export class TokenFakeModule {}
