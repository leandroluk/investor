import {Database} from '#/core/port/database';
import {Module} from '@nestjs/common';
import {DatabaseFakeAdapter} from './database-fake.adapter';

@Module({
  providers: [
    DatabaseFakeAdapter, //
    {provide: Database, useExisting: DatabaseFakeAdapter},
  ],
  exports: [Database],
})
export class DatabaseFakeModule {}
