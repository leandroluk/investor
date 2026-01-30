import {Token} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';

@Injectable()
export class TokenFakeAdapter extends Token {
  create<T extends boolean>(
    _sessionKey: string,
    _claims: Token.Claims,
    includeRefresh?: true
  ): T extends true ? Required<Token.Authorization> : Token.Authorization {
    const token: Token.Authorization = {
      tokenType: 'Bearer',
      accessToken: 'fake-access-token',
      expiresIn: '3600',
    };
    if (includeRefresh) {
      token.refreshToken = 'fake-refresh-token';
    }
    return token as any;
  }

  decode(_token: string): Token.Decoded {
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
