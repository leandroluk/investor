import {Mailer} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(Mailer)
export class MailerFakeAdapter extends Mailer {
  async send(_message: Mailer.Message): Promise<void> {}
}
