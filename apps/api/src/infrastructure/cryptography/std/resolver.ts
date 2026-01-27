// infrastructure/cryptography/std/resolver.ts
import {Resolver} from '@/core/di';
import {type Cryptography} from '@/port';
import z from 'zod';
import {CryptographyStdAdapter} from './adapter';

export class CryptographyStdResolver extends Resolver<Cryptography> {
  private readonly schema = z.object({
    key: z.string().length(32),
  });

  async resolve(): Promise<Cryptography> {
    const config = await this.schema.parseAsync({
      key: process.env.API_CRYPTOGRAPHY_STD_KEY || ''.padStart(32, 'a'),
    });
    return new CryptographyStdAdapter(config);
  }
}
