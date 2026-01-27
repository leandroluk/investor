// infrastructure/logger/json/adapter.ts
import {canThrow} from '@/core/decorator';
import {Logger} from '@/port';
import path from 'node:path';
import winston from 'winston';
import {LoggerJsonError} from './error';

export interface JsonAdapterConfig {
  readonly level: string;
  readonly path: string;
  readonly meta: Record<string, any>;
}

export class JsonAdapter implements Logger {
  private client: winston.Logger;

  constructor(private readonly config: JsonAdapterConfig) {
    this.client = winston.createLogger({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: path.join(this.config.path, 'combined.log')}),
      ],
      level: this.config.level,
      defaultMeta: this.config.meta,
    });
  }

  @canThrow(LoggerJsonError)
  debug(message: string, meta?: Record<string, any>): void {
    this.client.debug(message, meta);
  }

  @canThrow(LoggerJsonError)
  info(message: string, meta?: Record<string, any>): void {
    this.client.info(message, meta);
  }

  @canThrow(LoggerJsonError)
  warn(message: string, meta?: Record<string, any>): void {
    this.client.warn(message, meta);
  }

  @canThrow(LoggerJsonError)
  error(message: string, error: Error, meta?: Record<string, any>): void {
    this.client.error(message, {error, ...meta});
  }

  @canThrow(LoggerJsonError)
  child(meta: Record<string, any>): Logger {
    return new JsonAdapter({...this.config, meta: {...this.config.meta, ...meta}});
  }
}
