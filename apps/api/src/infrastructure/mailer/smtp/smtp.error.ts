export class MailerSmtpError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MailerSmtpError';
  }
}
