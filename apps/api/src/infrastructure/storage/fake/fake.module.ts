import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {StorageFakeAdapter} from './fake.adapter';

const providers = [StorageFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class StorageFakeModule {}
