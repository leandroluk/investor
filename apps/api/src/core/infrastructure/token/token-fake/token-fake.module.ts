import {Token} from '#/core/port/token';
import {Module} from '@nestjs/common';
import {TokenFakeAdapter} from './token-fake.adapter';

@Module({
  providers: [
    TokenFakeAdapter, //
    {provide: Token, useExisting: TokenFakeAdapter},
  ],
  exports: [Token],
})
export class TokenFakeModule {}
