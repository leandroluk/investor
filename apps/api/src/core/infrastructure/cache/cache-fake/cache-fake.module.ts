import {Cache} from '#/core/port/cache';
import {Module} from '@nestjs/common';
import {CacheFakeAdapter} from './cache-fake.adapter';

@Module({
  providers: [
    CacheFakeAdapter, //
    {provide: Cache, useExisting: CacheFakeAdapter},
  ],
  exports: [Cache],
})
export class CacheFakeModule {}
