import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class LoggerWinstonConfig {
  static readonly schema = z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    isJson: z.preprocess(v => ['true', '1'].includes(v as any), z.boolean()).default(false),
  });

  constructor() {
    Object.assign(
      this,
      LoggerWinstonConfig.schema.parse({
        level: process.env.API_LOGGER_WINSTON_LEVEL,
        isJson: process.env.API_LOGGER_WINSTON_JSON,
      })
    );
  }

  readonly level!: 'error' | 'warn' | 'info' | 'debug';
  readonly isJson!: boolean;
}
