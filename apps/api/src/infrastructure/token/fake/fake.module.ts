import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TokenFakeAdapter} from './fake.adapter';

const providers = [TokenFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class TokenFakeModule {}
