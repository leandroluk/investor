import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class OidcFakeConfig {
  static readonly schema = z.object({
    baseUri: z.string().default('http://localhost:20000'),
    googleCallback: z.string().default('auth/google/callback'),
    microsoftCallback: z.string().default('auth/microsoft/callback'),
    port: z.coerce.number().default(19999),
    serverPort: z.coerce.number().default(20000),
  });

  constructor() {
    Object.assign(
      this,
      OidcFakeConfig.schema.parse({
        baseUri: process.env.API_OIDC_BASE_URI,
        googleCallback: process.env.API_OIDC_GOOGLE_CALLBACK,
        microsoftCallback: process.env.API_OIDC_MICROSOFT_CALLBACK,
        port: process.env.API_OIDC_FAKE_PORT,
        serverPort: process.env.API_OIDC_FAKE_SERVER_PORT,
      })
    );
  }

  readonly baseUri!: string;
  readonly googleCallback!: string;
  readonly microsoftCallback!: string;
  readonly port!: number;
  readonly serverPort!: number;
}
