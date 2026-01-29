import {Token, TokenAuthorization, TokenClaims, TokenDecoded} from '#/core/port/token';
import {Injectable} from '@nestjs/common';

@Injectable()
export class TokenFakeAdapter extends Token {
  create<T extends boolean>(
    _sessionKey: string,
    _claims: TokenClaims,
    includeRefresh?: true
  ): T extends true ? Required<TokenAuthorization> : TokenAuthorization {
    const token: TokenAuthorization = {
      tokenType: 'Bearer',
      accessToken: 'fake-access-token',
      expiresIn: '3600',
    };
    if (includeRefresh) {
      token.refreshToken = 'fake-refresh-token';
    }
    return token as any;
  }

  decode(_token: string): TokenDecoded {
    return {
      kind: 'access',
      sessionKey: 'fake-session-key',
      claims: {
        subject: 'fake-subject',
        email: 'fake@email.com',
        givenName: 'Fake',
        familyName: 'User',
      },
    };
  }

  getAccessTokenTTL(): number {
    return 3600;
  }

  getRefreshTokenTTL(): number {
    return 86400;
  }
}
