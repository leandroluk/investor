// infrastructure/mailing/smtp/error.ts
export class MailingSmtpError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MailingSmtpError';
  }
}
