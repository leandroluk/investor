import {StoragePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(StoragePort)
export class StorageFakeAdapter implements StoragePort {
  async save(_path: string, _file: Buffer, _mimeType: string): Promise<string> {
    return 'http://fake/file';
  }

  async get(_path: string): Promise<Buffer> {
    return Buffer.from('');
  }

  async delete(_path: string): Promise<void> {}

  async getSignedUrl(_path: string, _expires: number): Promise<string> {
    return 'http://fake/signed-url';
  }
}
