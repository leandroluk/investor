import {CoinbasePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CoinbaseAxiosAdapter} from './axios.adapter';
import {CoinbaseAxiosConfig} from './axios.config';

@EnhancedModule({
  providers: [CoinbaseAxiosAdapter, CoinbaseAxiosConfig],
  exports: [CoinbasePort],
})
export class CoinbaseAxiosModule {}
