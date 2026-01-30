import {Logger} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(Logger)
export class LoggerFakeAdapter extends Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
