import {Injectable, type LoggerService} from '@nestjs/common';
import {LoggerPort} from './domain/_shared/ports';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly ignoredContexts = ['RoutesResolver', 'RouterExplorer', 'NestApplication', 'InstanceLoader'];

  constructor(private readonly loggerPort: LoggerPort) {}

  log(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    if (!this.ignoredContexts.includes(context)) {
      this.loggerPort.info(message, {context});
    }
  }

  error(message: string, ...optionalParams: any[]): void {
    const error = optionalParams.find(p => p instanceof Error) || new Error(message);
    const context = optionalParams[optionalParams.length - 1];

    const metadata = optionalParams.filter(p => !(p instanceof Error) && p !== context);
    this.loggerPort.error(message, error, {context, params: metadata, log_type: 'exception'});
  }

  warn(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    this.loggerPort.warn(message, {context, params: optionalParams.slice(0, -1)});
  }

  debug(message: string, ...optionalParams: any[]): void {
    const context = optionalParams[optionalParams.length - 1];
    this.loggerPort.debug(message, {context, params: optionalParams.slice(0, -1)});
  }

  verbose(message: string, ...optionalParams: any[]): void {
    this.debug(message, ...optionalParams);
  }
}
