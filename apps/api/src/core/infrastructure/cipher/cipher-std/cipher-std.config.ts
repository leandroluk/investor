import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class CipherStdConfig {
  static readonly schema = z.object({
    key: z.string().max(32).default(''.padStart(32, 'a')),
  });

  constructor() {
    Object.assign(
      this,
      CipherStdConfig.schema.parse({
        key: process.env.API_CIPHER_STD_KEY,
      })
    );
  }

  readonly key!: string;
}
