import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {BrokerKafkaModule} from './kafka';

@Module({})
export class BrokerModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(BrokerModule, {
      envVar: 'API_BROKER_PROVIDER',
      envSelectedProvider: 'kafka',
      envProviderMap: {kafka: BrokerKafkaModule},
      global: true,
    });
  }
}
