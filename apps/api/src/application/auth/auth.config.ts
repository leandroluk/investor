import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class AuthConfig {
  static readonly schema = z.object({
    webBaseURL: z.string().default('http://localhost:20001'),
    webOidcPath: z.string().default('auth/callback'),
    webActivatePath: z.string().default('auth/activate'),
    webRecoverPath: z.string().default('auth/recover'),
  });

  constructor() {
    Object.assign(
      this,
      AuthConfig.schema.parse({
        webBaseURL: process.env.WEB_BASE_URL,
        webOidcPath: process.env.WEB_OIDC_PATH,
        webActivatePath: process.env.WEB_ACTIVATE_PATH,
        webRecoverPath: process.env.WEB_RECOVER_PATH,
      })
    );
  }

  readonly webBaseURL!: string;
  readonly webOidcPath!: string;
  readonly webActivatePath!: string;
  readonly webRecoverPath!: string;
}
