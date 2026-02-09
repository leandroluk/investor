import {Throws} from '#/application/_shared/decorators';
import {StoragePort} from '#/domain/_shared/ports';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {StorageS3CompatConfig} from './s3compat.config';
import {S3CompatError} from './s3compat.error';

@Throws(S3CompatError)
@InjectableExisting(StoragePort)
export class StorageS3CompatAdapter implements StoragePort {
  private readonly client: S3Client;

  constructor(private readonly config: StorageS3CompatConfig) {
    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: this.config.forcePathStyle,
    });
  }

  async save(path: string, file: Buffer, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({Bucket: this.config.bucket, Key: path, Body: file, ContentType: mimeType});
    await this.client.send(command);
    return path;
  }

  async get(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({Bucket: this.config.bucket, Key: path});
    const response = await this.client.send(command);
    const byteArray = await response.Body?.transformToByteArray();
    return Buffer.from(byteArray || []);
  }

  async delete(path: string): Promise<void> {
    const command = new DeleteObjectCommand({Bucket: this.config.bucket, Key: path});
    await this.client.send(command);
  }

  async getSignedUrl(path: string, expires: number, mode: 'read' | 'write'): Promise<string> {
    const config = {Bucket: this.config.bucket, Key: path};
    const command = mode === 'write' ? new PutObjectCommand(config) : new GetObjectCommand(config);
    return getSignedUrl(this.client, command, {expiresIn: expires});
  }
}
