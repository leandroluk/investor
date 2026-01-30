import {Cipher} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {CipherStdAdapter} from './std.adapter';
import {CipherStdConfig} from './std.config';

@Module({
  providers: [
    CipherStdAdapter, //
    CipherStdConfig,
    {provide: Cipher, useExisting: CipherStdAdapter},
  ],
  exports: [Cipher],
})
export class CipherStdModule {}
