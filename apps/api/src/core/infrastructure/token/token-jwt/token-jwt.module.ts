import {Token} from '#/core/port/token';
import {Module} from '@nestjs/common';
import {TokenJwtAdapter} from './token-jwt.adapter';
import {TokenJwtConfig} from './token-jwt.config';

@Module({
  providers: [
    TokenJwtConfig, //
    TokenJwtAdapter,
    {provide: Token, useExisting: TokenJwtAdapter},
  ],
  exports: [Token],
})
export class TokenJwtModule {}
