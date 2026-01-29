import {DynamicModule, Module} from '@nestjs/common';
import {CipherFakeModule} from './cipher-fake/cipher-fake.module';
import {CipherStdModule} from './cipher-std/cipher-std.module';

@Module({})
export class CipherModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_CIPHER_PROVIDER || 'std';

    const selectedModule = {
      std: CipherStdModule,
      fake: CipherFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Cipher Provider: ${provider}`);
    }

    return {
      global: true,
      module: CipherModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
