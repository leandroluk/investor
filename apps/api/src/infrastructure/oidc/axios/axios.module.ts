import {Oidc} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcAxiosResolver} from './axios.adapter';
import {OidcAxiosConfig} from './axios.config';

@EnhancedModule({
  providers: [OidcAxiosResolver, OidcAxiosConfig],
  exports: [Oidc],
})
export class OidcAxiosModule {}
