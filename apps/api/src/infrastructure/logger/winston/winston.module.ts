import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {LoggerWinstonAdapter} from './winston.adapter';
import {LoggerWinstonConfig} from './winston.config';

const providers = [LoggerWinstonAdapter, LoggerWinstonConfig];

@EnhancedModule({providers, exports: providers})
export class LoggerWinstonModule {}
