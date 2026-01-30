import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class OidcFakeConfig {
  static readonly schema = z.object({
    baseUri: z.string().default('http://localhost:20000'),
    googleCallback: z.string().default('auth/google/callback'),
    microsoftCallback: z.string().default('auth/microsoft/callback'),
    port: z.number().default(19999),
  });

  constructor() {
    Object.assign(
      this,
      OidcFakeConfig.schema.parse({
        baseUri: process.env.API_OIDC_BASE_URI,
        googleCallback: process.env.API_OIDC_GOOGLE_CALLBACK,
        microsoftCallback: process.env.API_OIDC_MICROSOFT_CALLBACK,
        port: process.env.API_OIDC_AXIOS_FAKE_PORT,
      })
    );
  }

  readonly port!: number;
  readonly baseUri!: string;
  readonly googleCallback!: string;
  readonly microsoftCallback!: string;
}
