import {type Readable} from 'node:stream';

export abstract class OidcPort {
  abstract getAdapter(provider: 'microsoft' | 'google'): OidcPort.Adapter;

  encodeState(state: OidcPort.State): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  }

  decodeState(base64State: string): OidcPort.State {
    return JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
  }
}
export namespace OidcPort {
  export interface State {
    callbackURL: string;
    provider: string;
  }
  export interface Claims {
    subject: string;
    email: string;
    givenName: string;
    familyName: string;
    custom: Record<string, any>;
  }
  export interface Tokens {
    accessToken: string;
    refreshToken: string;
  }
  export interface Adapter {
    getAuthURL(base64State: string): string;
    exchange(code: string): Promise<Tokens>;
    getToken(refreshToken: string): Promise<Tokens>;
    getInfo(accessToken: string): Promise<Claims>;
    getPicture(accessToken: string): Promise<Readable>;
  }
}
