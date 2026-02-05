import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcAxiosConfig} from './axios.config';
import {OidcAxiosResolver} from './axios.resolver';

const providers = [OidcAxiosResolver, OidcAxiosConfig];

@EnhancedModule({providers, exports: providers})
export class OidcAxiosModule {}
