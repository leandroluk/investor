import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {LoggerFakeAdapter} from './fake.adapter';

const providers = [LoggerFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class LoggerFakeModule {}
