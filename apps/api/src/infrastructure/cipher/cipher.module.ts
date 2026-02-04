import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {CipherStdModule} from './std';

@Module({})
export class CipherModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(CipherModule, {
      envVar: 'API_CIPHER_PROVIDER',
      envSelectedProvider: 'std',
      envProviderMap: {std: CipherStdModule},
      global: true,
    });
  }
}
