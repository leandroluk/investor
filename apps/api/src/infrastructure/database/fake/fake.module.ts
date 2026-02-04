import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {DatabaseFakeAdapter} from './fake.adapter';

const providers = [DatabaseFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class DatabaseFakeModule {}
