import {type Readable} from 'node:stream';

export abstract class Oidc {
  abstract getAdapter(provider: 'microsoft' | 'google'): Oidc.Adapter;

  encodeState(state: Oidc.State): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  }

  decodeState(base64State: string): Oidc.State {
    return JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
  }
}
export namespace Oidc {
  export type State = {
    callbackURL: string;
    provider: string;
  };
  export type Claims = {
    subject: string;
    email: string;
    givenName: string;
    familyName: string;
    custom: Record<string, any>;
  };
  export type Tokens = {
    accessToken: string;
    refreshToken: string;
  };
  export type Adapter = {
    getAuthURL(base64State: string): string;
    exchange(code: string): Promise<Tokens>;
    getToken(refreshToken: string): Promise<Tokens>;
    getInfo(accessToken: string): Promise<Claims>;
    getPicture(accessToken: string): Promise<Readable>;
  };
}
