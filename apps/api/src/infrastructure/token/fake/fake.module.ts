import {Token} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TokenFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [TokenFakeAdapter],
  exports: [Token],
})
export class TokenFakeModule {}
