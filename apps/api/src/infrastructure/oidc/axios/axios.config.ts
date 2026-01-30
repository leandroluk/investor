import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class OidcAxiosConfig {
  static readonly schema = z.object({
    baseUri: z.string().default('http://localhost:20000'),
    googleCallback: z.string().default('auth/google/callback'),
    microsoftCallback: z.string().default('auth/microsoft/callback'),
    microsoftClientId: z.string().default('API_OIDC_MICROSOFT_CLIENT_ID'),
    microsoftClientSecret: z.string().default('API_OIDC_MICROSOFT_CLIENT_SECRET'),
    googleClientId: z.string().default('API_OIDC_GOOGLE_CLIENT_ID'),
    googleClientSecret: z.string().default('API_OIDC_GOOGLE_CLIENT_SECRET'),
  });

  constructor() {
    Object.assign(
      this,
      OidcAxiosConfig.schema.parse({
        baseUri: process.env.API_OIDC_BASE_URI,
        googleCallback: process.env.API_OIDC_GOOGLE_CALLBACK,
        microsoftCallback: process.env.API_OIDC_MICROSOFT_CALLBACK,
        microsoftClientId: process.env.API_OIDC_AXIOS_MICROSOFT_CLIENT_ID,
        microsoftClientSecret: process.env.API_OIDC_AXIOS_MICROSOFT_CLIENT_SECRET,
        googleClientId: process.env.API_OIDC_AXIOS_GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.API_OIDC_AXIOS_GOOGLE_CLIENT_SECRET,
      })
    );
  }

  readonly baseUri!: string;
  readonly googleCallback!: string;
  readonly microsoftCallback!: string;
  readonly microsoftClientId!: string;
  readonly microsoftClientSecret!: string;
  readonly googleClientId!: string;
  readonly googleClientSecret!: string;
}
