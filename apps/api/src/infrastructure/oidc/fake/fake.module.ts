import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcFakeAdapter} from './fake.adapter';
import {OidcFakeConfig} from './fake.config';

const providers = [OidcFakeAdapter, OidcFakeConfig];

@EnhancedModule({providers, exports: providers})
export class OidcFakeModule {}
