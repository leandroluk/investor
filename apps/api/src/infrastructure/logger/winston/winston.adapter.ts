import {Logger} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Logger as WinstonLogger, createLogger, format, transports} from 'winston';
import LokiTransport from 'winston-loki';
import {LoggerWinstonConfig} from './winston.config';

@InjectableExisting(Logger)
export class LoggerWinstonAdapter implements Logger {
  private readonly winston: WinstonLogger;
  private readonly noJsonFormat = format.combine(
    format.colorize(),
    format.printf(({timestamp, level, message, ...meta}) => {
      const cleanMeta = Object.fromEntries(Object.entries(meta).filter(([_, value]) => value !== undefined));
      const metaString = Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : '';
      return `${timestamp as string} ${level}: ${message as string} ${metaString}`;
    })
  );

  constructor(private readonly config: LoggerWinstonConfig) {
    const loggerTransports: any[] = [new transports.Console()];

    if (this.config.lokiUrl) {
      loggerTransports.push(
        new LokiTransport({
          host: this.config.lokiUrl,
          labels: {app: 'investor-api'},
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          onConnectionError: (err: Error): void => console.error('Loki Error', err),
        })
      );
    }

    this.winston = createLogger({
      level: this.config.level,
      format: format.combine(
        format.timestamp(),
        format.errors({stack: true}),
        this.config.isJson ? format.json() : this.noJsonFormat
      ),
      transports: loggerTransports,
    });
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.winston.debug(message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.winston.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.winston.warn(message, meta);
  }

  error(message: string, error: Error, meta?: Record<string, any>): void {
    this.winston.error(message, {
      ...meta,
      error,
      stack: error.stack,
      labels: {correlationId: meta?.messageId || 'internal-process'},
    });
  }
}
