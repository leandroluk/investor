// infrastructure/jwt/jose/adapter.ts
import {canThrow} from '@/core/decorator';
import {Jwt} from '@/port';
import jsonwebtoken from 'jsonwebtoken';
import {JwtJoseError} from './error';

export interface JoseAdapterConfig {
  readonly privateKey: string;
  readonly publicKey: string;
  readonly algorithm: string;
  readonly issuer: string;
  readonly audience: string;
  readonly accessTTL: number;
  readonly refreshTTL: number;
}

export class JoseAdapter implements Jwt {
  constructor(private readonly config: JoseAdapterConfig) {}

  @canThrow(JwtJoseError)
  async create(sessionId: string, claims: Jwt.Claims, includeRefresh?: boolean): Promise<Jwt.Token> {
    const payload = {
      email: claims.email,
      given_name: claims.givenName,
      family_name: claims.familyName,
      language: claims.language,
      timezone: claims.timezone,
    };

    const token: Jwt.Token = {
      tokenType: 'Bearer',
      accessToken: jsonwebtoken.sign({...payload, kind: 'access'}, this.config.privateKey, {
        subject: claims.subject,
        jwtid: sessionId,
        algorithm: this.config.algorithm as jsonwebtoken.Algorithm,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.accessTTL,
      }),
      expiresIn: this.config.accessTTL,
    };

    if (includeRefresh) {
      token.refreshToken = jsonwebtoken.sign({...payload, kind: 'refresh'}, this.config.privateKey, {
        subject: claims.subject,
        jwtid: sessionId,
        algorithm: this.config.algorithm as jsonwebtoken.Algorithm,
        issuer: this.config.issuer,
        audience: this.config.audience,
        expiresIn: this.config.refreshTTL,
      });
    }

    return token;
  }

  @canThrow(JwtJoseError)
  async decode(token: string): Promise<Jwt.Decoded> {
    const decoded = jsonwebtoken.verify(token, this.config.publicKey, {
      algorithms: [this.config.algorithm as jsonwebtoken.Algorithm],
      issuer: this.config.issuer,
      audience: this.config.audience,
    }) as jsonwebtoken.JwtPayload;

    return {
      kind: decoded.kind,
      sessionId: decoded.jti!,
      claims: {
        subject: decoded.sub!,
        email: decoded.email,
        givenName: decoded.given_name ?? null,
        familyName: decoded.family_name ?? null,
        language: decoded.language ?? null,
        timezone: decoded.timezone ?? null,
      },
      issuedAt: new Date((decoded.iat ?? 0) * 1000),
      expiresAt: new Date((decoded.exp ?? 0) * 1000),
    };
  }

  getAccessTokenTTL(): number {
    return this.config.accessTTL;
  }

  getRefreshTokenTTL(): number {
    return this.config.refreshTTL;
  }
}
