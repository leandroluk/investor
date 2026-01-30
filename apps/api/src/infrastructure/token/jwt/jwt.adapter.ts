import {Throws} from '#/application/_shared/decorator';
import {Token} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import {TokenJwtConfig} from './jwt.config';
import {TokenJwtError} from './jwt.error';

@Throws(TokenJwtError)
@Throws(TokenJwtError)
@InjectableExisting(Token)
export class TokenJwtAdapter implements Token {
  constructor(private readonly config: TokenJwtConfig) {}

  create<T extends boolean>(
    sessionKey: string,
    claims: Token.Claims,
    includeRefresh?: T
  ): T extends true ? Required<Token.Authorization> : Token.Authorization {
    const token: Token.Authorization = {
      tokenType: 'Bearer',
      accessToken: jsonwebtoken.sign(claims, this.config.privateKey, {
        algorithm: this.config.algorithm,
        audience: this.config.audience,
        issuer: this.config.issuer,
        jwtid: sessionKey,
        expiresIn: this.config.accessTTL,
        header: {alg: this.config.algorithm, typ: 'access'},
      }),
      expiresIn: ms(this.config.accessTTL),
    };

    if (includeRefresh) {
      token.refreshToken = jsonwebtoken.sign(claims, this.config.privateKey, {
        algorithm: this.config.algorithm,
        audience: this.config.audience,
        issuer: this.config.issuer,
        jwtid: sessionKey,
        expiresIn: this.config.refreshTTL,
        header: {alg: this.config.algorithm, typ: 'refresh'},
      });
    }

    return token as any;
  }

  decode(token: string): Token.Decoded {
    const {header, payload} = jsonwebtoken.verify(token, this.config.publicKey, {
      algorithms: [this.config.algorithm],
      audience: this.config.audience,
      issuer: this.config.issuer,
      complete: true,
    }) as Omit<jsonwebtoken.Jwt, 'payload'> & {payload: jsonwebtoken.JwtPayload};

    return {
      kind: header.typ as Token.Decoded['kind'],
      sessionKey: payload.jti!,
      claims: {
        subject: payload.sub!,
        email: payload.email,
        familyName: payload.family_name,
        givenName: payload.given_name,
        language: payload.language,
        timezone: payload.timezone,
      } as Token.Claims,
    };
  }

  getAccessTokenTTL(): number {
    return this.config.accessTTL;
  }

  getRefreshTokenTTL(): number {
    return this.config.refreshTTL;
  }
}
