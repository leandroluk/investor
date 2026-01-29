import {Throws} from '#/core/application/decorator/throws';
import {Token, TokenAuthorization, TokenClaims, TokenDecoded} from '#/core/port/token';
import {Injectable} from '@nestjs/common';
import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import {TokenJwtConfig} from './token-jwt.config';
import {TokenJwtError} from './token-jwt.error';

@Throws(TokenJwtError)
@Injectable()
export class TokenJwtAdapter implements Token {
  constructor(private readonly config: TokenJwtConfig) {}

  create<T extends boolean>(
    sessionKey: string,
    claims: TokenClaims,
    includeRefresh?: T
  ): T extends true ? Required<TokenAuthorization> : TokenAuthorization {
    const token: TokenAuthorization = {
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

  decode(token: string): TokenDecoded {
    const {header, payload} = jsonwebtoken.verify(token, this.config.publicKey, {
      algorithms: [this.config.algorithm],
      audience: this.config.audience,
      issuer: this.config.issuer,
      complete: true,
    }) as Omit<jsonwebtoken.Jwt, 'payload'> & {payload: jsonwebtoken.JwtPayload};

    return {
      kind: header.typ as TokenDecoded['kind'],
      sessionKey: payload.jti!,
      claims: {
        subject: payload.sub!,
        email: payload.email,
        familyName: payload.family_name,
        givenName: payload.given_name,
        language: payload.language,
        timezone: payload.timezone,
      } as TokenClaims,
    };
  }

  getAccessTokenTTL(): number {
    return this.config.accessTTL;
  }

  getRefreshTokenTTL(): number {
    return this.config.refreshTTL;
  }
}
