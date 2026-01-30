import {Oidc} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcFakeAdapter} from './fake.adapter';
import {OidcFakeConfig} from './fake.config';

@EnhancedModule({
  providers: [OidcFakeAdapter, OidcFakeConfig],
  exports: [Oidc],
})
export class OidcFakeModule {}
