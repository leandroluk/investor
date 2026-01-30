import {Token} from '#/domain/_shared/port';
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
