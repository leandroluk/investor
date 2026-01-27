// port/jwt.ts
export abstract class Jwt {
  /**
   * Creates a new JWT token.
   * @param sessionId The session ID to bind the token to.
   * @param claims User claims data.
   * @param includeRefresh If true, generates a refresh token.
   */
  abstract create(sessionId: string, claims: Jwt.Claims, includeRefresh?: boolean): Promise<Jwt.Token>;

  /**
   * Decodes a JWT token.
   * @param token The token string.
   */
  abstract decode(token: string): Promise<Jwt.Decoded>;

  /**
   * Returns the access token TTL in milliseconds.
   */
  abstract getAccessTokenTTL(): number;

  /**
   * Returns the refresh token TTL in milliseconds.
   */
  abstract getRefreshTokenTTL(): number;
}
export namespace Jwt {
  export interface Claims {
    subject: string;
    email: string;
    givenName: string | null;
    familyName: string | null;
    language: string | null;
    timezone: string | null;
  }

  export interface Token {
    tokenType: string;
    accessToken: string;
    refreshToken?: string; // Retorna string vazia ou null se não solicitado
    expiresIn: number; // Geralmente em segundos
  }

  export interface Decoded {
    kind: 'access' | 'refresh';
    sessionId: string;
    claims: Claims;
    issuedAt: Date;
    expiresAt: Date;
  }
}
