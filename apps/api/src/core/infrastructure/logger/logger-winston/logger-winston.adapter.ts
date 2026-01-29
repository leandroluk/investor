import {Logger} from '#/core/port/logger';
import {Injectable} from '@nestjs/common';
import {Logger as WinstonLogger, createLogger, format, transports} from 'winston';
import {LoggerWinstonConfig} from './logger-winston.config';

@Injectable()
export class LoggerWinstonAdapter implements Logger {
  private readonly instance: WinstonLogger;

  constructor(private readonly config: LoggerWinstonConfig) {
    this.instance = createLogger({
      level: this.config.level,
      format: format.combine(
        format.timestamp(),
        format.errors({stack: true}),
        this.config.isJson ? format.json() : format.combine(format.colorize(), format.simple())
      ),
      transports: [new transports.Console()],
    });
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.instance.debug(message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.instance.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.instance.warn(message, meta);
  }

  error(message: string, error: Error, meta?: Record<string, any>): void {
    this.instance.error(message, {extra: meta, error});
  }
}
