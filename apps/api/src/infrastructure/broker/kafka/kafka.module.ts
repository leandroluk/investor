import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BrokerKafkaAdapter} from './kafka.adapter';
import {BrokerKafkaConfig} from './kafka.config';
import {BrokerKafkaLifecycle} from './kafka.lifecycle';

const providers = [BrokerKafkaAdapter, BrokerKafkaConfig, BrokerKafkaLifecycle];

@EnhancedModule({providers, exports: providers})
export class BrokerKafkaModule {}
