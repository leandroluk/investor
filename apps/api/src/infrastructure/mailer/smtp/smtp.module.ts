import {Mailer} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {MailerSmtpAdapter} from './smtp.adapter';
import {MailerSmtpConfig} from './smtp.config';

@Module({
  providers: [
    MailerSmtpConfig, //
    MailerSmtpAdapter,
    {provide: Mailer, useExisting: MailerSmtpAdapter},
  ],
  exports: [Mailer],
})
export class MailerSmtpModule {}
