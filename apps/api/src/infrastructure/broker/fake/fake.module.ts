import {Broker} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {BrokerFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    BrokerFakeAdapter, //
    {provide: Broker, useExisting: BrokerFakeAdapter},
  ],
  exports: [Broker],
})
export class BrokerFakeModule {}
