import {Blockchain} from '#/core/port/blockchain';
import {Module} from '@nestjs/common';
import {BlockchainFakeAdapter} from './blockchain-fake.adapter';

@Module({
  providers: [
    BlockchainFakeAdapter, //
    {provide: Blockchain, useExisting: BlockchainFakeAdapter},
  ],
  exports: [Blockchain],
})
export class BlockchainFakeModule {}
