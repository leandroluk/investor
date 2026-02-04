import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TokenJwtAdapter} from './jwt.adapter';
import {TokenJwtConfig} from './jwt.config';

const providers = [TokenJwtAdapter, TokenJwtConfig];

@EnhancedModule({providers, exports: providers})
export class TokenJwtModule {}
