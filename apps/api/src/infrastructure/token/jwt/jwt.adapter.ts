import {Throws} from '#/application/_shared/decorators';
import {TokenPort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import jsonwebtoken from 'jsonwebtoken';
import {TokenJwtConfig} from './jwt.config';
import {TokenJwtError} from './jwt.error';

@Throws(TokenJwtError)
@InjectableExisting(TokenPort)
export class TokenJwtAdapter implements TokenPort {
  constructor(private readonly tokenJwtConfig: TokenJwtConfig) {}

  create<T extends boolean>(data: TokenPort.CreateData<T>): TokenPort.CreateReturn<T> {
    const token: TokenPort.Authorization = {
      tokenType: 'Bearer',
      accessToken: jsonwebtoken.sign(data.claims, this.tokenJwtConfig.privateKey, {
        algorithm: this.tokenJwtConfig.algorithm,
        audience: this.tokenJwtConfig.audience,
        issuer: this.tokenJwtConfig.issuer,
        jwtid: data.sessionKey,
        expiresIn: this.tokenJwtConfig.accessTTL,
        header: {alg: this.tokenJwtConfig.algorithm, typ: 'access'},
      }),
      expiresIn: this.tokenJwtConfig.accessTTL,
    };

    if (data.complete) {
      token.refreshToken = jsonwebtoken.sign(data.claims, this.tokenJwtConfig.privateKey, {
        algorithm: this.tokenJwtConfig.algorithm,
        audience: this.tokenJwtConfig.audience,
        issuer: this.tokenJwtConfig.issuer,
        jwtid: data.sessionKey,
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
      claims: payload as TokenPort.Claims,
    };
  }
}
