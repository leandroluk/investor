import {BrokerPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {BrokerKafkaAdapter} from './kafka.adapter';
import {BrokerKafkaConfig} from './kafka.config';
import {BrokerKafkaLifecycle} from './kafka.lifecycle';

@EnhancedModule({
  providers: [BrokerKafkaAdapter, BrokerKafkaConfig, BrokerKafkaLifecycle],
  exports: [BrokerPort],
})
export class BrokerKafkaModule {}
