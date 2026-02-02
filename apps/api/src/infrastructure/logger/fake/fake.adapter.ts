import {LoggerPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(LoggerPort)
export class LoggerFakeAdapter extends LoggerPort {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
