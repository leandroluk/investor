import {OidcPort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import axios from 'axios';
import {OidcFakeConfig} from './fake.config';

@InjectableExisting(OidcPort)
export class OidcFakeResolver extends OidcPort {
  constructor(private readonly oidcFakeConfig: OidcFakeConfig) {
    super();
  }

  getAdapter(_provider: 'microsoft' | 'google'): OidcPort.Adapter {
    const baseURL = `http://localhost:${this.oidcFakeConfig.port}`;
    return {
      getAuthURL: (base64State: string) => `${baseURL}/auth?state=${base64State}`,
      exchange: async (_code: string): Promise<OidcPort.Tokens> => {
        return axios.get(`${baseURL}/token`).then(res => res.data);
      },
      getToken: async (_refreshToken: string): Promise<OidcPort.Tokens> => {
        return axios.get(`${baseURL}/token`).then(res => res.data);
      },
      getInfo: async (_accessToken: string): Promise<OidcPort.Claims> => {
        return axios.get(`${baseURL}/info`).then(res => res.data);
      },
    };
  }
}
