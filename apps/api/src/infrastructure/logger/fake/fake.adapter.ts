import {Logger} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';

@Injectable()
export class LoggerFakeAdapter extends Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}
