import {OidcAdapter, OidcClaims, OidcTokens} from '#/core/port/oidc';
import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {Readable} from 'node:stream';
import {OidcAxiosConfig} from './oidc-axios.config';

@Injectable()
export class OidcAxiosGoogleAdapter extends OidcAdapter {
  private readonly authorizeURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenURL = 'https://oauth2.googleapis.com/token';
  private readonly userinfoURL = 'https://openidconnect.googleapis.com/v1/userinfo';
  private readonly tokenHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
  private readonly scope = 'openid profile email';
  private readonly redirectURL = `${this.config.baseUri}${this.config.googleCallback}`;

  constructor(private readonly config: OidcAxiosConfig) {
    super();
  }

  getAuthURL(state: Record<string, any>): string {
    const url = new URL(this.authorizeURL);
    url.searchParams.set('client_id', this.config.googleClientId);
    url.searchParams.set('redirect_uri', this.redirectURL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('state', this.encodeState(state));
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('include_granted_scopes', 'false');
    url.searchParams.set('prompt', 'consent');
    return url.toString();
  }

  async exchange(code: string): Promise<OidcTokens> {
    const body = new URLSearchParams({
      client_id: this.config.googleClientId,
      client_secret: this.config.googleClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectURL,
    });
    const data = await axios //
      .post(this.tokenURL, body, {headers: this.tokenHeaders})
      .then(res => res.data);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async getToken(refreshToken: string): Promise<OidcTokens> {
    const body = new URLSearchParams({
      client_id: this.config.googleClientId,
      client_secret: this.config.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
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
    const data = await axios
      .get(this.userinfoURL, {headers: {Authorization: `Bearer ${accessToken}`}})
      .then(res => res.data);
    return {
      subject: data.sub,
      email: data.email,
      givenName: data.given_name,
      familyName: data.family_name,
      custom: {picture: data.picture},
    };
  }

  async getPicture(accessToken: string): Promise<Readable> {
    const info = await axios
      .get(this.userinfoURL, {headers: {Authorization: `Bearer ${accessToken}`}})
      .then(res => res.data);
    const stream = await axios //
      .get(info.picture, {responseType: 'stream'})
      .then(res => res.data);
    return stream;
  }
}
