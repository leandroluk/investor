import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {TokenJwtModule} from './jwt';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(TokenModule, {
      envVar: 'API_TOKEN_PROVIDER',
      envSelectedProvider: 'jwt',
      envProviderMap: {jwt: TokenJwtModule},
      global: true,
    });
  }
}
