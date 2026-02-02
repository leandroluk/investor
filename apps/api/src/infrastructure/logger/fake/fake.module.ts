import {LoggerPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {LoggerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [LoggerFakeAdapter],
  exports: [LoggerPort],
})
export class LoggerFakeModule {}
