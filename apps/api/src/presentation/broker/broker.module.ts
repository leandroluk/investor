import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {BrokerSubscriber} from './broker.subscriber';

@Module({
  imports: [CqrsModule],
  providers: [BrokerSubscriber],
})
export class BrokerModule {}
