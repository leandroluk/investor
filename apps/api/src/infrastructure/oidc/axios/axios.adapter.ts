import {OidcPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import axios from 'axios';
import {Readable} from 'node:stream';
import {OidcAxiosConfig} from './axios.config';

@InjectableExisting(OidcPort)
export class OidcAxiosResolver extends OidcPort {
  private readonly googleAdapter!: OidcAxiosGoogleAdapter;
  private readonly microsoftAdapter!: OidcAxiosMicrosoftAdapter;

  private readonly adapterMap = {
    google: this.googleAdapter,
    microsoft: this.microsoftAdapter,
  };

  constructor(private readonly config: OidcAxiosConfig) {
    super();
    this.googleAdapter = new OidcAxiosGoogleAdapter(config);
    this.microsoftAdapter = new OidcAxiosMicrosoftAdapter(config);
  }

  getAdapter(provider: 'microsoft' | 'google'): OidcPort.Adapter {
    const adapter = this.adapterMap[provider];

    if (!adapter) {
      throw new Error(`Invalid provider: ${provider}`);
    }

    return adapter;
  }
}

class OidcAxiosGoogleAdapter implements OidcPort.Adapter {
  private readonly authorizeURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenURL = 'https://oauth2.googleapis.com/token';
  private readonly userinfoURL = 'https://openidconnect.googleapis.com/v1/userinfo';
  private readonly tokenHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
  private readonly scope = 'openid profile email';
  private readonly redirectURL = `${this.config.baseUri}${this.config.googleCallback}`;

  constructor(private readonly config: OidcAxiosConfig) {}

  getAuthURL(base64State: string): string {
    const url = new URL(this.authorizeURL);
    url.searchParams.set('client_id', this.config.googleClientId);
    url.searchParams.set('redirect_uri', this.redirectURL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('state', base64State);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('include_granted_scopes', 'false');
    url.searchParams.set('prompt', 'consent');
    return url.toString();
  }

  async exchange(code: string): Promise<OidcPort.Tokens> {
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

  async getToken(refreshToken: string): Promise<OidcPort.Tokens> {
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

  async getInfo(accessToken: string): Promise<OidcPort.Claims> {
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

class OidcAxiosMicrosoftAdapter implements OidcPort.Adapter {
  private readonly authorizeURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  private readonly tokenURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly pictureURL = 'https://graph.microsoft.com/v1.0/me/photo/$value';
  private readonly tokenHeaders = {'Content-Type': 'application/x-www-form-urlencoded'};
  private readonly scope = 'openid profile email offline_access User.Read';
  private readonly redirectURL = `${this.config.baseUri}${this.config.microsoftCallback}`;

  constructor(private readonly config: OidcAxiosConfig) {}

  getAuthURL(base64State: string): string {
    const url = new URL(this.authorizeURL);
    url.searchParams.set('client_id', this.config.microsoftClientId);
    url.searchParams.set('redirect_uri', this.redirectURL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('state', base64State);
    url.searchParams.set('response_mode', 'query');
    return url.toString();
  }

  async exchange(code: string): Promise<OidcPort.Tokens> {
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

  async getToken(refreshToken: string): Promise<OidcPort.Tokens> {
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

  async getInfo(accessToken: string): Promise<OidcPort.Claims> {
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
