import {Logger} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {LoggerWinstonAdapter} from './winston.adapter';
import {LoggerWinstonConfig} from './winston.config';

@EnhancedModule({
  providers: [LoggerWinstonAdapter, LoggerWinstonConfig],
  exports: [Logger],
})
export class LoggerWinstonModule {}
