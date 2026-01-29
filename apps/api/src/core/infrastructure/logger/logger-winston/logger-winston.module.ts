import {Logger} from '#/core/port/logger';
import {Module} from '@nestjs/common';
import {LoggerWinstonAdapter} from './logger-winston.adapter';
import {LoggerWinstonConfig} from './logger-winston.config';

@Module({
  providers: [
    LoggerWinstonConfig, //
    LoggerWinstonAdapter,
    {provide: Logger, useExisting: LoggerWinstonAdapter},
  ],
  exports: [Logger],
})
export class LoggerWinstonModule {}
