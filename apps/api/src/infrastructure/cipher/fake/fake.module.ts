import {Cipher} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CipherFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    CipherFakeAdapter, //
    {provide: Cipher, useExisting: CipherFakeAdapter},
  ],
  exports: [Cipher],
})
export class CipherFakeModule {}
