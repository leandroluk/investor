import {Throws} from '#/application/_shared/decorator';
import {CipherPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import crypto from 'node:crypto';
import {CipherStdConfig} from './std.config';
import {CipherStdError} from './std.error';

@Throws(CipherStdError)
@InjectableExisting(CipherPort)
export class CipherStdAdapter implements CipherPort {
  private readonly algorithm = 'aes-256-gcm';
  private readonly plainEncoding = 'utf8';
  private readonly cipherEncoding = 'base64url';
  private readonly key = this.cipherStdConfig.key.padEnd(32, '_');

  constructor(private readonly cipherStdConfig: CipherStdConfig) {}

  async hash(plainText: string): Promise<string> {
    return crypto.createHash('sha256').update(plainText).digest(this.cipherEncoding);
  }

  async encrypt<T = any>(plain: T, iv = crypto.randomBytes(12).toString(this.cipherEncoding)): Promise<string> {
    const plainText = JSON.stringify(plain);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plainText, this.plainEncoding, this.cipherEncoding);
    encrypted += cipher.final(this.cipherEncoding);
    const tag = cipher.getAuthTag().toString(this.cipherEncoding);
    return [iv, encrypted, tag].join('.');
  }

  async decrypt<T = any>(cipherText: string): Promise<T> {
    const [iv, encrypted, tag] = cipherText.split('.');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv as string);
    decipher.setAuthTag(Buffer.from(tag as string, this.cipherEncoding));
    let plainText = decipher.update(encrypted as string, this.cipherEncoding, this.plainEncoding);
    plainText += decipher.final(this.plainEncoding);
    const plain = JSON.parse(plainText);
    return plain;
  }
}
