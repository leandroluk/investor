import {Mailer} from '#/core/port/mailer';
import {Module} from '@nestjs/common';
import {MailerSmtpAdapter} from './mailer-smtp.adapter';
import {MailerSmtpConfig} from './mailer-smtp.config';

@Module({
  providers: [
    MailerSmtpConfig, //
    MailerSmtpAdapter,
    {provide: Mailer, useExisting: MailerSmtpAdapter},
  ],
  exports: [Mailer],
})
export class MailerSmtpModule {}
