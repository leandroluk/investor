import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class LoggerWinstonConfig {
  static readonly schema = z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    isJson: z.preprocess(v => ['true', '1'].includes(v as any), z.boolean()).default(false),
    lokiURL: z.url().optional(),
  });

  constructor() {
    Object.assign(
      this,
      LoggerWinstonConfig.schema.parse({
        level: process.env.API_LOGGER_WINSTON_LEVEL,
        isJson: process.env.API_LOGGER_WINSTON_JSON,
        lokiURL: process.env.API_LOGGER_WINSTON_LOKI_URL,
      })
    );
  }

  readonly level!: 'error' | 'warn' | 'info' | 'debug';
  readonly isJson!: boolean;
  readonly lokiURL?: string;
}
