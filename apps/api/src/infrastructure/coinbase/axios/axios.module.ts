import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CoinbaseAxiosAdapter} from './axios.adapter';
import {CoinbaseAxiosConfig} from './axios.config';

const providers = [CoinbaseAxiosAdapter, CoinbaseAxiosConfig];

@EnhancedModule({providers, exports: providers})
export class CoinbaseAxiosModule {}
