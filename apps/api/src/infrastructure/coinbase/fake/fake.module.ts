import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CoinbaseFakeAdapter} from './fake.adapter';

const providers = [CoinbaseFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class CoinbaseFakeModule {}
