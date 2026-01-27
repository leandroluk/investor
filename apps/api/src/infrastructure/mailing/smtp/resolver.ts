// infrastructure/mailing/smtp/resolver.ts
import {Resolver} from '@/core/di';
import {type Mailer} from '@/port';
import z from 'zod';
import {SmtpAdapter} from './adapter';

export class MailingSmtpResolver extends Resolver<Mailer> {
  private readonly schema = z.object({
    host: z.string().min(1),
    port: z.coerce.number().int().positive(),
    username: z.string().min(1),
    password: z.string().min(1),
    from: z.string().email(),
  });

  async resolve(): Promise<Mailer> {
    const config = await this.schema.parseAsync({
      host: process.env.API_MAILING_SMTP_HOST,
      port: Number(process.env.API_MAILING_SMTP_PORT) || 587,
      username: process.env.API_MAILING_SMTP_USERNAME,
      password: process.env.API_MAILING_SMTP_PASSWORD,
      from: process.env.API_MAILING_SMTP_FROM ?? 'noreply@investor.com',
    });
    return new SmtpAdapter(config);
  }
}
