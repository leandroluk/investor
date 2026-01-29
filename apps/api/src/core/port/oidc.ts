import {type Readable} from 'node:stream';

export type OidcClaims = {
  subject: string;
  email: string;
  givenName: string;
  familyName: string;
  custom: Record<string, any>;
};

export type OidcTokens = {
  accessToken: string;
  refreshToken: string;
};

export abstract class OidcAdapter {
  encodeState(state: Record<string, any>): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  }

  decodeState(base64State: string): Record<string, any> {
    return JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
  }

  abstract getAuthURL(state: Record<string, any>): string;
  abstract exchange(code: string): Promise<OidcTokens>;
  abstract getToken(refreshToken: string): Promise<OidcTokens>;
  abstract getInfo(accessToken: string): Promise<OidcClaims>;
  abstract getPicture(accessToken: string): Promise<Readable>;
}

export abstract class OidcResolver {
  abstract getAdapter(provider: 'microsoft' | 'google'): OidcAdapter;
}
