import {Logger} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {LoggerFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [LoggerFakeAdapter],
  exports: [Logger],
})
export class LoggerFakeModule {}
