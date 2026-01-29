import {Mailer} from '#/core/port/mailer';
import {Module} from '@nestjs/common';
import {MailerFakeAdapter} from './mailer-fake.adapter';

@Module({
  providers: [
    MailerFakeAdapter, //
    {provide: Mailer, useExisting: MailerFakeAdapter},
  ],
  exports: [Mailer],
})
export class MailerFakeModule {}
