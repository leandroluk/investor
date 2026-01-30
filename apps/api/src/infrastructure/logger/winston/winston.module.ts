import {Logger} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {LoggerWinstonAdapter} from './winston.adapter';
import {LoggerWinstonConfig} from './winston.config';

@Module({
  providers: [
    LoggerWinstonConfig, //
    LoggerWinstonAdapter,
    {provide: Logger, useExisting: LoggerWinstonAdapter},
  ],
  exports: [Logger],
})
export class LoggerWinstonModule {}
