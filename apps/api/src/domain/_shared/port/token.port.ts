export abstract class TokenPort {
  abstract create<T extends boolean>(
    sessionKey: string,
    claims: TokenPort.Claims,
    complete?: true
  ): Promise<T extends true ? Required<TokenPort.Authorization> : TokenPort.Authorization>;
  abstract decode(token: string): Promise<TokenPort.Decoded>;
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
    expiresIn: number;
    refreshToken?: string;
  }
  export interface Decoded {
    kind: 'access' | 'refresh';
    sessionKey: string;
    claims: Claims;
  }
}
