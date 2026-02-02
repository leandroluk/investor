import {HasherPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(HasherPort)
export class HasherFakeAdapter extends HasherPort {
  async hash(_plainText: string): Promise<string> {
    return 'text';
  }

  async compare(_plain: string, _hash: string): Promise<boolean> {
    return true;
  }
}
