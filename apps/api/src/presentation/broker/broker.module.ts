import {Module} from '@nestjs/common';
import {BrokerSubscriber} from './broker.subscriber';

@Module({
  providers: [BrokerSubscriber],
})
export class BrokerModule {}
