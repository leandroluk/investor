import {Mailer} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerSmtpAdapter} from './smtp.adapter';
import {MailerSmtpConfig} from './smtp.config';

@EnhancedModule({
  providers: [MailerSmtpAdapter, MailerSmtpConfig],
  exports: [Mailer],
})
export class MailerSmtpModule {}
