import {CipherPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(CipherPort)
export class CipherFakeAdapter extends CipherPort {
  async hash(_plainText: string): Promise<string> {
    return 'text';
  }
  async encrypt<TType = any>(_plain: TType, _iv?: string): Promise<string> {
    return 'text';
  }

  async decrypt<TType = any>(_cipher: string): Promise<TType> {
    return 'text' as any;
  }
}
