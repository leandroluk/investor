import {CoinbasePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CoinbaseFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [CoinbaseFakeAdapter],
  exports: [CoinbasePort],
})
export class CoinbaseFakeModule {}
