// infrastructure/interpolate/mustache/resolver.ts
import {Resolver} from '@/core/di';
import {type Renderer} from '@/port';
import z from 'zod';
import {MustacheAdapter} from './adapter';

export class InterpolateMustacheResolver extends Resolver<Renderer> {
  private readonly schema = z.object({
    path: z.string().min(1),
  });

  async resolve(): Promise<Renderer> {
    const config = await this.schema.parseAsync({
      path: process.env.API_INTERPOLATE_MUSTACHE_PATH || 'apps/api/src/template',
    });
    return new MustacheAdapter(config);
  }
}
