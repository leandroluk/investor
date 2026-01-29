export type MailerAttachment = {
  filename: string;
  contentType: string;
  content: Buffer;
};

export type MailerMessage = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailerAttachment[];
};

export abstract class Mailer {
  abstract send(message: MailerMessage): Promise<void>;
}
