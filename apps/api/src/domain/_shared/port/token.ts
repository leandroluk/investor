export abstract class Token {
  abstract create<T extends boolean>(
    sessionKey: string,
    claims: Token.Claims,
    complete?: true
  ): T extends true ? Required<Token.Authorization> : Token.Authorization;
  abstract decode(token: string): Token.Decoded;
  abstract getAccessTokenTTL(): number;
  abstract getRefreshTokenTTL(): number;
}
export namespace Token {
  export type Claims = {
    subject: string;
    email: string;
    givenName?: string;
    familyName?: string;
    language?: string;
    timezone?: string;
  };
  export type Authorization = {
    tokenType: string;
    accessToken: string;
    expiresIn: string;
    refreshToken?: string;
  };
  export type Decoded = {
    kind: 'access' | 'refresh';
    sessionKey: string;
    claims: Claims;
  };
}
