import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerSmtpAdapter} from './smtp.adapter';
import {MailerSmtpConfig} from './smtp.config';

const providers = [MailerSmtpAdapter, MailerSmtpConfig];

@EnhancedModule({providers, exports: providers})
export class MailerSmtpModule {}
