import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CipherStdAdapter} from './std.adapter';
import {CipherStdConfig} from './std.config';

const providers = [CipherStdAdapter, CipherStdConfig];

@EnhancedModule({providers, exports: providers})
export class CipherStdModule {}
