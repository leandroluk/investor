import {Oidc} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';
import axios from 'axios';
import {Readable} from 'stream';
import {OidcFakeConfig} from './fake.config';

@Injectable()
export class OidcFakeAdapter extends Oidc {
  constructor(private readonly config: OidcFakeConfig) {
    super();
  }

  getAdapter(_provider: 'microsoft' | 'google'): Oidc.Adapter {
    const baseUrl = `http://localhost:${this.config.port}`;
    return {
      getAuthURL: (base64State: string) => `${baseUrl}/auth?state=${base64State}`,
      exchange: async (_code: string): Promise<Oidc.Tokens> => {
        return axios.get(`${baseUrl}/token`).then(res => res.data);
      },
      getToken: async (_refreshToken: string): Promise<Oidc.Tokens> => {
        return axios.get(`${baseUrl}/token`).then(res => res.data);
      },
      getInfo: async (_accessToken: string): Promise<Oidc.Claims> => {
        return axios.get(`${baseUrl}/info`).then(res => res.data);
      },
      getPicture: async (_accessToken: string): Promise<Readable> => {
        return axios.get(`${baseUrl}/picture`, {responseType: 'stream'}).then(res => res.data);
      },
    };
  }
}
