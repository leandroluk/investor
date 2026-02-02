import {MailerPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [MailerFakeAdapter],
  exports: [MailerPort],
})
export class MailerFakeModule {}
