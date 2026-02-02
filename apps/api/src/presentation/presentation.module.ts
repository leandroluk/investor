import {Module} from '@nestjs/common';
import {BrokerModule} from './broker/broker.module';
import {HttpModule} from './http/http.module';

const modules = [BrokerModule, HttpModule];

@Module({imports: modules, exports: modules})
export class PresentationModule {}
