export abstract class Mailer {
  abstract send(message: Mailer.Message): Promise<void>;
}
export namespace Mailer {
  export type Attachment = {
    filename: string;
    contentType: string;
    content: Buffer;
  };
  export type Message = {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  };
}
