import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {HasherFakeAdapter} from './fake.adapter';

const providers = [HasherFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class HasherFakeModule {}
