import {Mailer} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';

@Injectable()
export class MailerFakeAdapter extends Mailer {
  async send(_message: Mailer.Message): Promise<void> {}
}
