import {OidcAdapter, OidcClaims, OidcTokens} from '#/core/port/oidc';
import {Injectable} from '@nestjs/common';
import {Readable} from 'node:stream';

@Injectable()
export class OidcFakeAdapter extends OidcAdapter {
  getAuthURL(_state: Record<string, any>): string {
    return 'http://localhost:3000';
  }

  async exchange(_code: string): Promise<OidcTokens> {
    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  }

  async getToken(_refreshToken: string): Promise<OidcTokens> {
    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  }

  async getInfo(_accessToken: string): Promise<OidcClaims> {
    return {
      email: 'email',
      givenName: 'givenName',
      familyName: 'familyName',
      subject: 'subject',
      custom: {},
    };
  }

  async getPicture(_accessToken: string): Promise<Readable> {
    return new Readable();
  }
}
