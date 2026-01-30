import {Broker} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BrokerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [BrokerFakeAdapter],
  exports: [Broker],
})
export class BrokerFakeModule {}
