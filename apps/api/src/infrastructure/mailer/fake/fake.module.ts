import {Mailer} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [MailerFakeAdapter],
  exports: [Mailer],
})
export class MailerFakeModule {}
