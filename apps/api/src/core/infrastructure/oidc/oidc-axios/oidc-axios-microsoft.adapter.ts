import {OidcAdapter, OidcClaims, OidcTokens} from '#/core/port/oidc';
import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {Readable} from 'node:stream';
import {OidcAxiosConfig} from './oidc-axios.config';

@Injectable()
export class OidcAxiosMicrosoftAdapter extends OidcAdapter {
  private readonly authorizeURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  private readonly tokenURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly pictureURL = 'https://graph.microsoft.com/v1.0/me/photo/$value';
  private readonly tokenHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
  private readonly scope = 'openid profile email offline_access User.Read';
  private readonly redirectURL = `${this.config.baseUri}${this.config.microsoftCallback}`;

  constructor(private readonly config: OidcAxiosConfig) {
    super();
  }

  getAuthURL(state: Record<string, any>): string {
    const url = new URL(this.authorizeURL);
    url.searchParams.set('client_id', this.config.microsoftClientId);
    url.searchParams.set('redirect_uri', this.redirectURL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('state', this.encodeState(state));
    url.searchParams.set('response_mode', 'query');
    return url.toString();
  }

  async exchange(code: string): Promise<OidcTokens> {
    const body = new URLSearchParams({
      client_id: this.config.microsoftClientId,
      client_secret: this.config.microsoftClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectURL,
      scope: this.scope,
    });
    const data = await axios //
      .post(this.tokenURL, body, {headers: this.tokenHeaders})
      .then(res => res.data);
    return data.refresh_token;
  }

  async getToken(refreshToken: string): Promise<OidcTokens> {
    const body = new URLSearchParams({
      client_id: this.config.microsoftClientId,
      client_secret: this.config.microsoftClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: this.scope,
    });
    const data = await axios //
      .post(this.tokenURL, body, {headers: this.tokenHeaders})
      .then(res => res.data);
    return {
      accessToken: data.access_token,
      refreshToken,
    };
  }

  async getInfo(accessToken: string): Promise<OidcClaims> {
    const data = await axios //
      .get('https://graph.microsoft.com/oidc/userinfo', {headers: {Authorization: `Bearer ${accessToken}`}})
      .then(res => res.data);
    return {
      subject: data.sub,
      email: data.email,
      givenName: data.given_name ?? data.givenname ?? data.givenName,
      familyName: data.family_name ?? data.familyname ?? data.familyName,
      custom: {},
    };
  }

  async getPicture(accessToken: string): Promise<Readable> {
    const response = await axios.get(this.pictureURL, {
      headers: {Authorization: `Bearer ${accessToken}`},
      responseType: 'stream',
    });
    return response.data;
  }
}
