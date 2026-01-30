import {Coinbase} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CoinbaseFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    CoinbaseFakeAdapter, //
    {provide: Coinbase, useExisting: CoinbaseFakeAdapter},
  ],
  exports: [Coinbase],
})
export class CoinbaseFakeModule {}
