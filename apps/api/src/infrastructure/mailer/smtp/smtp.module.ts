import {MailerPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerSmtpAdapter} from './smtp.adapter';
import {MailerSmtpConfig} from './smtp.config';

@EnhancedModule({
  providers: [MailerSmtpAdapter, MailerSmtpConfig],
  exports: [MailerPort],
})
export class MailerSmtpModule {}
