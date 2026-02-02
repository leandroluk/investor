export abstract class MailerPort {
  abstract send(message: MailerPort.Message): Promise<void>;
}
export namespace MailerPort {
  export interface Attachment {
    filename: string;
    contentType: string;
    content: Buffer;
  }
  export interface Message {
    to: string[];
    from?: string;
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }
}
