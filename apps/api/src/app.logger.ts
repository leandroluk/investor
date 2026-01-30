import {Injectable, type LoggerService} from '@nestjs/common';
import {Logger} from './domain/_shared/port';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly ignoredContexts = ['RoutesResolver', 'RouterExplorer', 'NestApplication', 'InstanceLoader'];

  constructor(private readonly logger: Logger) {}

  log(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    if (!this.ignoredContexts.includes(context)) {
      this.logger.info(message, {context});
    }
  }

  error(message: string, ...optionalParams: any[]): void {
    const error = optionalParams.find(p => p instanceof Error) || new Error(message);
    const context = optionalParams[optionalParams.length - 1];

    const metadata = optionalParams.filter(p => !(p instanceof Error) && p !== context);
    this.logger.error(message, error, {context, params: metadata, log_type: 'exception'});
  }

  warn(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    this.logger.warn(message, {context, params: optionalParams.slice(0, -1)});
  }

  debug(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    this.logger.debug(message, {context, params: optionalParams.slice(0, -1)});
  }

  verbose(message: string, ...optionalParams: any[]): void {
    this.debug(message, ...optionalParams);
  }
}
