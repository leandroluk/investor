import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class TemplateMustacheConfig {
  static readonly schema = z.object({
    path: z.string().default('./src/template'),
  });

  constructor() {
    Object.assign(
      this,
      TemplateMustacheConfig.schema.parse({
        path: process.env.API_TEMPLATE_MUSTACHE_PATH,
      })
    );
  }

  readonly path!: string;
}
