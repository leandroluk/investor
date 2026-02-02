import {TokenPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(TokenPort)
export class TokenFakeAdapter extends TokenPort {
  create<T extends boolean>(
    _sessionKey: string,
    _claims: TokenPort.Claims,
    includeRefresh?: true
  ): T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization {
    const token: TokenPort.Authorization = {
      tokenType: 'Bearer',
      accessToken: 'fake-access-token',
      expiresIn: '3600',
    };
    if (includeRefresh) {
      token.refreshToken = 'fake-refresh-token';
    }
    return token as any;
  }

  decode(_token: string): TokenPort.Decoded {
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
