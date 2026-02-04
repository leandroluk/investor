import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CacheFakeAdapter} from './fake.adapter';

const providers = [CacheFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class CacheFakeModule {}
