// infrastructure/logger/json/resolver.ts
import {Resolver} from '@/core/di';
import {type Logger} from '@/port';
import z from 'zod';
import {JsonAdapter as LoggerJsonAdapter} from './adapter';

export class LoggerJsonResolver extends Resolver<Logger> {
  private readonly schema = z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    path: z.string().optional().default('.tmp'),
    meta: z.record(z.string(), z.any()).default({}),
  });

  async resolve(): Promise<Logger> {
    const config = await this.schema.parseAsync({
      level: process.env.API_LOGGER_JSON_LEVEL ?? 'info',
      path: process.env.API_LOGGER_JSON_PATH ?? '.tmp',
      meta: JSON.parse((process.env.API_LOGGER_JSON_META || '{}').trim()),
    });
    return new LoggerJsonAdapter(config);
  }
}
