import {Throws} from '#/application/_shared/decorator';
import {Storage} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {StorageS3CompatConfig} from './s3compat.config';
import {S3CompatError} from './s3compat.error';

@Throws(S3CompatError)
@InjectableExisting(Storage)
export class StorageS3CompatAdapter implements Storage {
  constructor(private readonly config: StorageS3CompatConfig) {}

  async save(_path: string, _file: Buffer, _mimeType: string): Promise<string> {
    return 'http://s3-compat/file';
  }

  async get(_path: string): Promise<Buffer> {
    return Buffer.from('');
  }

  async delete(_path: string): Promise<void> {}

  async getSignedUrl(_path: string, _expires: number): Promise<string> {
    return 'http://s3-compat/signed-url';
  }
}
