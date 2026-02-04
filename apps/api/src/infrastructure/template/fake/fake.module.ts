import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TemplateFakeAdapter} from './fake.adapter';

const providers = [TemplateFakeAdapter];

@EnhancedModule({providers, exports: providers})
export class TemplateFakeModule {}
