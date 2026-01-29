import {DynamicModule, Module} from '@nestjs/common';
import {TokenFakeModule} from './token-fake/token-fake.module';
import {TokenJwtModule} from './token-jwt/token-jwt.module';

@Module({})
export class TokenModule {
  static forRoot(): DynamicModule {
    const provider = process.env.API_CIPHER_PROVIDER || 'jwt';

    const selectedModule = {
      jwt: TokenJwtModule,
      fake: TokenFakeModule,
    }[provider];

    if (!selectedModule) {
      throw new TypeError(`Invalid Token Provider: ${provider}`);
    }

    return {
      global: true,
      module: TokenModule,
      imports: [selectedModule],
      exports: [selectedModule],
    };
  }
}
