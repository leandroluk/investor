import {Cipher} from '#/core/port/cipher';
import {Module} from '@nestjs/common';
import {CipherFakeAdapter} from './cipher.fake.adapter';

@Module({
  providers: [
    CipherFakeAdapter, //
    {provide: Cipher, useExisting: CipherFakeAdapter},
  ],
  exports: [Cipher],
})
export class CipherFakeModule {}
