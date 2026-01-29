import {Logger} from '#/core/port/logger';
import {Module} from '@nestjs/common';
import {LoggerFakeAdapter} from './logger-fake.adapter';

@Module({
  providers: [
    LoggerFakeAdapter, //
    {provide: Logger, useExisting: LoggerFakeAdapter},
  ],
  exports: [Logger],
})
export class LoggerFakeModule {}
