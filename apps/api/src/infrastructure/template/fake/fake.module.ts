import {TemplatePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TemplateFakeAdapter} from './fake.adapter';

@EnhancedModule({
  providers: [TemplateFakeAdapter],
  exports: [TemplatePort],
})
export class TemplateFakeModule {}
