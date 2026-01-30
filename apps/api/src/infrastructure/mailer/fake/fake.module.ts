import {Mailer} from '#/domain/_shared/port';
import {Module} from '@nestjs/common';
import {MailerFakeAdapter} from './fake.adapter';

@Module({
  providers: [
    MailerFakeAdapter, //
    {provide: Mailer, useExisting: MailerFakeAdapter},
  ],
  exports: [Mailer],
})
export class MailerFakeModule {}
