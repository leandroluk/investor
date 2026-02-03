import {type UserEntity} from '#/domain/account/entity';

export abstract class TokenPort {
  abstract create<T extends boolean>(
    sessionKey: string,
    user: UserEntity,
    complete?: true
  ): Promise<T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization>;
  abstract decode(token: string): Promise<TokenPort.Decoded>;
}
export namespace TokenPort {
  export interface Claims {
    subject: UserEntity['id'];
    email: UserEntity['email'];
    name: UserEntity['name'];
    language: UserEntity['language'];
    timezone: UserEntity['timezone'];
  }
  export interface Authorization {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken?: string;
  }
  export interface Decoded {
    kind: 'access' | 'refresh';
    sessionKey: string;
    claims: Claims;
  }
}
