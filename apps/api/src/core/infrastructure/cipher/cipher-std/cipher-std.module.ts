import {Cipher} from '#/core/port/cipher';
import {Module} from '@nestjs/common';
import {CipherStdAdapter} from './cipher-std.adapter';
import {CipherStdConfig} from './cipher-std.config';

@Module({
  providers: [
    CipherStdAdapter, //
    CipherStdConfig,
    {provide: Cipher, useExisting: CipherStdAdapter},
  ],
  exports: [Cipher],
})
export class CipherStdModule {}
