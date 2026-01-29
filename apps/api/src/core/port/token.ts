export type TokenClaims = {
  subject: string;
  email: string;
  givenName?: string;
  familyName?: string;
  language?: string;
  timezone?: string;
};

export type TokenAuthorization = {
  tokenType: string;
  accessToken: string;
  expiresIn: string;
  refreshToken?: string;
};

export type TokenDecoded = {
  kind: 'access' | 'refresh';
  sessionKey: string;
  claims: TokenClaims;
};

export abstract class Token {
  abstract create<T extends boolean>(
    sessionKey: string,
    claims: TokenClaims,
    includeRefresh?: true
  ): T extends true ? Required<TokenAuthorization> : TokenAuthorization;
  abstract decode(token: string): TokenDecoded;
  abstract getAccessTokenTTL(): number;
  abstract getRefreshTokenTTL(): number;
}
