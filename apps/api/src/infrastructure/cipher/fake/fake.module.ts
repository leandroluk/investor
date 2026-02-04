import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {CipherFakeAdapter} from './fake.adapter';

const providers = [CipherFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class CipherFakeModule {}
