import {Retry, Throws, Trace} from '#/application/_shared/decorators';
import {MailerPort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {MailerSmtpConfig} from './smtp.config';
import {MailerSmtpError} from './smtp.error';

@Throws(MailerSmtpError)
@InjectableExisting(MailerPort)
export class MailerSmtpAdapter implements MailerPort {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly mailerSmtpConfig: MailerSmtpConfig) {
    const options: SMTPTransport.Options = {
      host: this.mailerSmtpConfig.host,
      port: this.mailerSmtpConfig.port,
      secure: this.mailerSmtpConfig.port === 465,
      requireTLS: this.mailerSmtpConfig.port === 587,
      auth: {
        user: this.mailerSmtpConfig.username,
        pass: this.mailerSmtpConfig.password,
      },
    };
    this.transporter = nodemailer.createTransport(options); // NOSONAR
  }

  @Trace()
  @Retry({attempts: 3, delay: 2000})
  async send(message: MailerPort.Message): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: message.from || this.mailerSmtpConfig.from,
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
