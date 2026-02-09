import {Throws} from '#/application/_shared/decorators';
import {HasherPort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import crypto from 'node:crypto';
import {HasherStdError} from './std.error';

@Throws(HasherStdError)
@InjectableExisting(HasherPort)
export class HasherStdAdapter implements HasherPort {
  private readonly cipherEncoding = 'base64url';

  hash(plainText: string): string {
    return crypto.createHash('sha256').update(plainText).digest(this.cipherEncoding);
  }

  compare(plain: string, hash: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(this.hash(plain)));
  }
}
