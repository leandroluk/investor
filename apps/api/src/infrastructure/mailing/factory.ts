// infrastructure/mailing/factory.ts
import {factory, Factory} from '@/core/di';
import {Mailer} from '@/port';
import {MailingSmtpResolver} from './smtp';

export enum MailingProvider {
  SMTP = 'smtp',
}

@factory(Mailer, (process.env.API_MAILING_PROVIDER ?? MailingProvider.SMTP) as MailingProvider, {
  [MailingProvider.SMTP]: MailingSmtpResolver,
})
export class MailingFactory extends Factory<Mailer, MailingProvider> {}
