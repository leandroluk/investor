import {TokenPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TokenJwtAdapter} from './jwt.adapter';
import {TokenJwtConfig} from './jwt.config';

@EnhancedModule({
  providers: [TokenJwtAdapter, TokenJwtConfig],
  exports: [TokenPort],
})
export class TokenJwtModule {}
