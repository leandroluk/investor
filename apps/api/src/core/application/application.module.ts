import {Module} from '@nestjs/common';
import {MonitorListener} from './monitoring/monitor.listener';

@Module({providers: [MonitorListener]})
export class ApplicationModule {}
