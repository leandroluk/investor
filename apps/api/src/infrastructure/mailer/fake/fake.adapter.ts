import {MailerPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(MailerPort)
export class MailerFakeAdapter extends MailerPort {
  async send(_message: MailerPort.Message): Promise<void> {}
}
