import {Broker} from '#/core/port/broker';
import {Module} from '@nestjs/common';
import {BrokerFakeAdapter} from './broker-fake.adapter';

@Module({
  providers: [
    BrokerFakeAdapter, //
    {provide: Broker, useExisting: BrokerFakeAdapter},
  ],
  exports: [Broker],
})
export class BrokerFakeModule {}
