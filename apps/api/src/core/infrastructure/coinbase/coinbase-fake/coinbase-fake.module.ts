import {Coinbase} from '#/core/port/coinbase';
import {Module} from '@nestjs/common';
import {CoinbaseFakeAdapter} from './coinbase-fake.adapter';

@Module({
  providers: [
    CoinbaseFakeAdapter, //
    {provide: Coinbase, useExisting: CoinbaseFakeAdapter},
  ],
  exports: [Coinbase],
})
export class CoinbaseFakeModule {}
