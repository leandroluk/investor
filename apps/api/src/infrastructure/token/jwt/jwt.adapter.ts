import {Throws} from '#/application/_shared/decorator';
import {TokenPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import {TokenJwtConfig} from './jwt.config';
import {TokenJwtError} from './jwt.error';

@Throws(TokenJwtError)
@Throws(TokenJwtError)
@InjectableExisting(TokenPort)
export class TokenJwtAdapter implements TokenPort {
  constructor(private readonly tokenJwtConfig: TokenJwtConfig) {}

  create<T extends boolean>(
    sessionKey: string,
    claims: TokenPort.Claims,
    includeRefresh?: T
  ): T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization {
    const token: TokenPort.Authorization = {
      tokenType: 'Bearer',
      accessToken: jsonwebtoken.sign(claims, this.tokenJwtConfig.privateKey, {
        algorithm: this.tokenJwtConfig.algorithm,
        audience: this.tokenJwtConfig.audience,
        issuer: this.tokenJwtConfig.issuer,
        jwtid: sessionKey,
        expiresIn: this.tokenJwtConfig.accessTTL,
        header: {alg: this.tokenJwtConfig.algorithm, typ: 'access'},
      }),
      expiresIn: ms(this.tokenJwtConfig.accessTTL),
    };

    if (includeRefresh) {
      token.refreshToken = jsonwebtoken.sign(claims, this.tokenJwtConfig.privateKey, {
        algorithm: this.tokenJwtConfig.algorithm,
        audience: this.tokenJwtConfig.audience,
        issuer: this.tokenJwtConfig.issuer,
        jwtid: sessionKey,
        expiresIn: this.tokenJwtConfig.refreshTTL,
        header: {alg: this.tokenJwtConfig.algorithm, typ: 'refresh'},
      });
    }

    return token as any;
  }

  decode(token: string): TokenPort.Decoded {
    const {header, payload} = jsonwebtoken.verify(token, this.tokenJwtConfig.publicKey, {
      algorithms: [this.tokenJwtConfig.algorithm],
      audience: this.tokenJwtConfig.audience,
      issuer: this.tokenJwtConfig.issuer,
      complete: true,
    }) as Omit<jsonwebtoken.Jwt, 'payload'> & {payload: jsonwebtoken.JwtPayload};

    return {
      kind: header.typ as TokenPort.Decoded['kind'],
      sessionKey: payload.jti!,
      claims: {
        subject: payload.sub!,
        email: payload.email,
        familyName: payload.family_name,
        givenName: payload.given_name,
        language: payload.language,
        timezone: payload.timezone,
      } as TokenPort.Claims,
    };
  }

  getAccessTokenTTL(): number {
    return this.tokenJwtConfig.accessTTL;
  }

  getRefreshTokenTTL(): number {
    return this.tokenJwtConfig.refreshTTL;
  }
}
