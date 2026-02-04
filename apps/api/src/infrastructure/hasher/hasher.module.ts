import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {HasherStdModule} from './std';

@Module({})
export class HasherModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(HasherModule, {
      envVar: 'API_HASHER_PROVIDER',
      envSelectedProvider: 'std',
      envProviderMap: {std: HasherStdModule},
      global: true,
    });
  }
}
