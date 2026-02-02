import {CipherPort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CipherStdAdapter} from './std.adapter';
import {CipherStdConfig} from './std.config';

@EnhancedModule({
  providers: [CipherStdAdapter, CipherStdConfig],
  exports: [CipherPort],
})
export class CipherStdModule {}
