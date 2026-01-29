import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class MailerSmtpConfig {
  static readonly schema = z.object({
    host: z.string().default('smtp.ethereal.email'),
    port: z.coerce.number().default(587),
    username: z.string(),
    password: z.string(),
    from: z.string().email().default('noreply@investor.dev'),
  });

  constructor() {
    Object.assign(
      this,
      MailerSmtpConfig.schema.parse({
        host: process.env.API_MAILER_SMTP_HOST,
        port: process.env.API_MAILER_SMTP_PORT,
        username: process.env.API_MAILER_SMTP_USERNAME,
        password: process.env.API_MAILER_SMTP_PASSWORD,
        from: process.env.API_MAILER_SMTP_FROM,
      })
    );
  }

  readonly host!: string;
  readonly port!: number;
  readonly username!: string;
  readonly password!: string;
  readonly from!: string;
}
