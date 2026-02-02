import {Throws} from '#/application/_shared/decorator';
import {HasherPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import crypto from 'node:crypto';
import {HasherStdError} from './std.error';

@Throws(HasherStdError)
@InjectableExisting(HasherPort)
export class HasherStdAdapter implements HasherPort {
  private readonly cipherEncoding = 'base64url';

  async hash(plainText: string): Promise<string> {
    return crypto.createHash('sha256').update(plainText).digest(this.cipherEncoding);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(await this.hash(plain)));
  }
}
