import {Cipher} from '#/core/port/cipher';
import {Injectable} from '@nestjs/common';

@Injectable()
export class CipherFakeAdapter extends Cipher {
  async encrypt<TType = any>(_plain: TType, _iv?: string): Promise<string> {
    return 'text';
  }

  async decrypt<TType = any>(_cipher: string): Promise<TType> {
    return 'text' as any;
  }
}
