import {Coinbase} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CoinbaseAxiosAdapter} from './axios.adapter';
import {CoinbaseAxiosConfig} from './axios.config';

@Module({
  providers: [
    CoinbaseAxiosConfig, //
    CoinbaseAxiosAdapter,
    {provide: Coinbase, useExisting: CoinbaseAxiosAdapter},
  ],
  exports: [Coinbase],
})
export class CoinbaseAxiosModule {}
