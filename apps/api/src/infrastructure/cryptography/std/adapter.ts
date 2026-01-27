// infrastructure/cryptography/std/adapter.ts
import {canThrow} from '@/core/decorator';
import {Cryptography} from '@/port';
import crypto from 'crypto';
import {CryptographyStdError} from './error';

export interface CryptographyStdAdapterConfig {
  readonly key: string;
}

export class CryptographyStdAdapter implements Cryptography {
  private readonly algorithm = 'aes-256-gcm';
  private readonly plainEncoding = 'utf8';
  private readonly cipherEncoding = 'base64url';

  constructor(private readonly config: CryptographyStdAdapterConfig) {}

  @canThrow(CryptographyStdError)
  async encrypt(plainText: string, iv = crypto.randomBytes(16).toString(this.cipherEncoding)): Promise<string> {
    const cipher = crypto.createCipheriv(this.algorithm, this.config.key, iv);
    let encrypted = cipher.update(plainText, this.plainEncoding, this.cipherEncoding);
    encrypted += cipher.final(this.cipherEncoding);
    const tag = cipher.getAuthTag().toString(this.cipherEncoding);
    return [iv, encrypted, tag].join('.');
  }

  @canThrow(CryptographyStdError)
  async decrypt(cipherText: string): Promise<string> {
    const [iv, encrypted, tag] = cipherText.split('.');
    const decipher = crypto.createDecipheriv(this.algorithm, this.config.key, iv as string);
    decipher.setAuthTag(Buffer.from(tag as string, this.cipherEncoding));
    let plainText = decipher.update(encrypted as string, this.cipherEncoding, this.plainEncoding);
    plainText += decipher.final(this.plainEncoding);
    return plainText;
  }
}
