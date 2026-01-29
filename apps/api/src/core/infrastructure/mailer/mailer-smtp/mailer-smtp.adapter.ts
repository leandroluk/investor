import {Retry} from '#/core/application/decorator/retry';
import {Throws} from '#/core/application/decorator/throws';
import {Trace} from '#/core/application/decorator/trace';
import {Mailer, MailerMessage} from '#/core/port/mailer';
import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {MailerSmtpConfig} from './mailer-smtp.config';
import {MailerSmtpError} from './mailer-smtp.error';

@Throws(MailerSmtpError)
@Injectable()
export class MailerSmtpAdapter implements Mailer {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly config: MailerSmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465,
      ignoreTLS: this.config.port === 587,
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
    } satisfies SMTPTransport.Options);
  }

  @Trace()
  @Retry({attempts: 3, delay: 2000})
  async send(message: MailerMessage): Promise<void> {
    await this.transporter.sendMail({
      from: message.from || this.config.from,
      to: message.to.join(','),
      cc: message.cc?.join(','),
      bcc: message.bcc?.join(','),
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments?.map(attachment => ({
        filename: attachment.filename,
        contentType: attachment.contentType,
        content: attachment.content,
      })),
    });
  }
}
