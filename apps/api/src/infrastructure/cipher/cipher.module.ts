import {DynamicModule, Module} from '@nestjs/common';
import {CipherFakeModule} from './fake';
import {CipherStdModule} from './std';

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
