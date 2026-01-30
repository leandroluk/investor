import {Database} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {DatabaseFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    DatabaseFakeAdapter, //
    {provide: Database, useExisting: DatabaseFakeAdapter},
  ],
  exports: [Database],
})
export class DatabaseFakeModule {}
