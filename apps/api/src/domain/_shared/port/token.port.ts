export abstract class TokenPort {
  abstract create<T extends boolean>(
    sessionKey: string,
    claims: TokenPort.Claims,
    complete?: true
  ): T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization;
  abstract decode(token: string): TokenPort.Decoded;
  abstract getAccessTokenTTL(): number;
  abstract getRefreshTokenTTL(): number;
}
export namespace TokenPort {
  export interface Claims {
    subject: string;
    email: string;
    givenName?: string;
    familyName?: string;
    language?: string;
    timezone?: string;
  }
  export interface Authorization {
    tokenType: string;
    accessToken: string;
    expiresIn: string;
    refreshToken?: string;
  }
  export interface Decoded {
    kind: 'access' | 'refresh';
    sessionKey: string;
    claims: Claims;
  }
}
