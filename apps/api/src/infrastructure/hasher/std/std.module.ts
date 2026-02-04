import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {HasherStdAdapter} from './std.adapter';

const providers = [HasherStdAdapter];

@EnhancedModule({providers, exports: providers})
export class HasherStdModule {}
