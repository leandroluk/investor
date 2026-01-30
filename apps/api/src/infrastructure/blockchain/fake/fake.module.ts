import {Blockchain} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {BlockchainFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    BlockchainFakeAdapter, //
    {provide: Blockchain, useExisting: BlockchainFakeAdapter},
  ],
  exports: [Blockchain],
})
export class BlockchainFakeModule {}
