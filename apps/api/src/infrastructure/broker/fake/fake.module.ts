import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BrokerFakeAdapter} from './fake.adapter';

const providers = [BrokerFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class BrokerFakeModule {}
