import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class StorageS3CompatConfig {
  static readonly schema = z.object({
    region: z.string().default('us-east-1'),
    bucket: z.string(),
    accessKey: z.string(),
    secretKey: z.string(),
    endpoint: z.string(),
    forcePathStyle: z.preprocess(v => ['1', 'true'].includes(v as any), z.boolean()).default(true),
  });
  constructor() {
    Object.assign(
      this,
      StorageS3CompatConfig.schema.parse({
        region: process.env.API_STORAGE_S3_REGION,
        bucket: process.env.API_STORAGE_S3_BUCKET,
        accessKey: process.env.API_STORAGE_S3_ACCESS_KEY,
        secretKey: process.env.API_STORAGE_S3_SECRET_KEY,
        endpoint: process.env.API_STORAGE_S3_ENDPOINT,
        forcePathStyle: process.env.API_STORAGE_S3_FORCE_PATH_STYLE,
      })
    );
  }

  readonly region!: string;
  readonly bucket!: string;
  readonly accessKey!: string;
  readonly secretKey!: string;
  readonly endpoint!: string;
  readonly forcePathStyle!: boolean;
}
