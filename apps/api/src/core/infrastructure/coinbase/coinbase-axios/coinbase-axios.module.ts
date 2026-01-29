import {Coinbase} from '#/core/port/coinbase';
import {Module} from '@nestjs/common';
import {CoinbaseAxiosAdapter} from './coinbase-axios.adapter';
import {CoinbaseAxiosConfig} from './coinbase-axios.config';

@Module({
  providers: [
    CoinbaseAxiosConfig, //
    CoinbaseAxiosAdapter,
    {provide: Coinbase, useExisting: CoinbaseAxiosAdapter},
  ],
  exports: [Coinbase],
})
export class CoinbaseAxiosModule {}
