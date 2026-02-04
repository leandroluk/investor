import {Throws} from '#/application/_shared/decorator';
import {TokenPort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import jsonwebtoken from 'jsonwebtoken';
import {TokenJwtConfig} from './jwt.config';
import {TokenJwtError} from './jwt.error';

@Throws(TokenJwtError)
@InjectableExisting(TokenPort)
export class TokenJwtAdapter implements TokenPort {
  constructor(private readonly tokenJwtConfig: TokenJwtConfig) {}

  async create<T extends boolean>(
    sessionKey: string,
    user: UserEntity,
    deviceFingerprintHash: string,
    includeRefresh?: T
  ): Promise<T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization> {
    const claims: TokenPort.Claims = {
      subject: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      timezone: user.timezone,
      hash: deviceFingerprintHash,
    };
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
      expiresIn: this.tokenJwtConfig.accessTTL,
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

  async decode(token: string): Promise<TokenPort.Decoded> {
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
        name: payload.name,
        language: payload.language,
        timezone: payload.timezone,
      } as TokenPort.Claims,
    };
  }
}
