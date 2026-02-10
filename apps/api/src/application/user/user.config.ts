import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class UserConfig {
  static readonly schema = z.object({
    webBaseURL: z.string().default('http://localhost:20001'),
    webOnboardPath: z.string().default('auth/callback'),
  });

  constructor() {
    Object.assign(
      this,
      UserConfig.schema.parse({
        webBaseURL: process.env.WEB_BASE_URL,
        webOnboardPath: process.env.WEB_ONBOARD_PATH,
      })
    );
  }

  readonly webBaseURL!: string;
  readonly webOnboardPath!: string;
}
