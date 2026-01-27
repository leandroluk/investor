// port/mailing.ts
export abstract class Mailer {
  /**
   * Sends a single email.
   * @param message The email message configuration.
   */
  abstract send(message: Mailer.Message): Promise<void>;
}
export namespace Mailer {
  export interface Attachment {
    filename: string;
    contentType: string;
    content: Buffer;
  }

  export interface Message {
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }
}
