import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {TokenFakeModule} from './fake';
import {TokenJwtModule} from './jwt';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(TokenModule, {
      envVar: 'API_TOKEN_PROVIDER',
      envSelectedProvider: 'jwt',
      envProviderMap: {jwt: TokenJwtModule, fake: TokenFakeModule},
      global: true,
    });
  }
}
