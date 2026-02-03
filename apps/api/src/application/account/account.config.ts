import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class AccountConfig {
  static readonly schema = z.object({
    webPort: z.coerce.number().default(20001),
    webBaseUrl: z.string().default('http://localhost:20001'),
    webOidcCallback: z.string().default('auth/callback'),
    webActivateCallback: z.string().default('auth/activate'),
    webRecoverCallback: z.string().default('auth/recover'),
  });

  constructor() {
    Object.assign(
      this,
      AccountConfig.schema.parse({
        webPort: process.env.WEB_PORT,
        webBaseUrl: process.env.WEB_BASE_URL,
        webOidcCallback: process.env.WEB_OIDC_CALLBACK,
        webActivateCallback: process.env.WEB_ACTIVATE_CALLBACK,
        webRecoverCallback: process.env.WEB_RECOVER_CALLBACK,
      })
    );
  }

  readonly webPort!: number;
  readonly webBaseUrl!: string;
  readonly webOidcCallback!: string;
  readonly webActivateCallback!: string;
  readonly webRecoverCallback!: string;
}
