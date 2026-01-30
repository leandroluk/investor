import {DynamicModule, Module} from '@nestjs/common';
import {BrokerFakeModule} from './fake';
import {BrokerKafkaModule} from './kafka';

@Module({})
export class BrokerModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_BROKER_PROVIDER || 'kafka';

    const selectedModule = {
      kafka: BrokerKafkaModule,
      fake: BrokerFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Broker Provider: ${provider}`);
    }

    return {
      global: true,
      module: BrokerModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
