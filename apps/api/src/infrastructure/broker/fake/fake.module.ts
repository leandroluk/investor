import {BrokerPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BrokerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [BrokerFakeAdapter],
  exports: [BrokerPort],
})
export class BrokerFakeModule {}
