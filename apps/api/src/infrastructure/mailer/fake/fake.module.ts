import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {MailerFakeAdapter} from './fake.adapter';

const providers = [MailerFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class MailerFakeModule {}
