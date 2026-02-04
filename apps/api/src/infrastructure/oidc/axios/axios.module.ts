import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {OidcAxiosResolver} from './axios.adapter';
import {OidcAxiosConfig} from './axios.config';

const providers = [OidcAxiosResolver, OidcAxiosConfig];

@EnhancedModule({providers, exports: providers})
export class OidcAxiosModule {}
