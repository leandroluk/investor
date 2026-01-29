import {Mailer, MailerMessage} from '#/core/port/mailer';
import {Injectable} from '@nestjs/common';

@Injectable()
export class MailerFakeAdapter extends Mailer {
  async send(_message: MailerMessage): Promise<void> {}
}
