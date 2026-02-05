import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcFakeConfig} from './fake.config';
import {OidcFakeLifecycle} from './fake.lifecycle';
import {OidcFakeResolver} from './fake.resolver';

const providers = [OidcFakeResolver, OidcFakeConfig, OidcFakeLifecycle];

@EnhancedModule({providers, exports: providers})
export class OidcFakeModule {}
