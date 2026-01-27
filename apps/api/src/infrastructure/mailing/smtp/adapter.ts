// infrastructure/mailing/smtp/adapter.ts
import {canThrow} from '@/core/decorator';
import {Mailer} from '@/port';
import {Transporter, createTransport} from 'nodemailer';
import {MailingSmtpError} from './error';

export interface SmtpAdapterConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly from: string;
}

export class SmtpAdapter implements Mailer {
  private readonly transporter: Transporter;

  constructor(private readonly config: SmtpAdapterConfig) {
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465,
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
    });
  }

  @canThrow(MailingSmtpError)
  async send(message: Mailer.Message): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments,
    });
  }
}
