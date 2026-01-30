import {Cache} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CacheFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    CacheFakeAdapter, //
    {provide: Cache, useExisting: CacheFakeAdapter},
  ],
  exports: [Cache],
})
export class CacheFakeModule {}
