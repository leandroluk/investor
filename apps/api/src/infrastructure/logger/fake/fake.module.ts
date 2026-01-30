import {Logger} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {LoggerFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    LoggerFakeAdapter, //
    {provide: Logger, useExisting: LoggerFakeAdapter},
  ],
  exports: [Logger],
})
export class LoggerFakeModule {}
