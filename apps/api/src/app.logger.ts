import {Logger} from '#/core/port/logger';
import {Injectable, type LoggerService} from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly ignoredContexts = ['RoutesResolver', 'RouterExplorer', 'NestApplication', 'InstanceLoader'];
  constructor(private readonly logger: Logger) {}

  log(message: string, ...optionalParams: any[]): void {
    if (!this.ignoredContexts.includes(optionalParams[optionalParams.length - 1])) {
      this.logger.info(message, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]): void {
    const [firstParam, ...params] = optionalParams;
    const context = params.pop();
    const error = firstParam instanceof Error ? firstParam : new Error(message);

    Sentry.captureException(error, {extra: {params}, tags: {context}});
    this.logger.error(message, error, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }
}
