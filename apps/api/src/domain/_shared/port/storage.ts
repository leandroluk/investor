export abstract class Storage {
  abstract save(path: string, file: Buffer, mimeType: string): Promise<string>;
  abstract get(path: string): Promise<Buffer>;
  abstract delete(path: string): Promise<void>;
  abstract getSignedUrl(path: string, expires: number): Promise<string>;
}
