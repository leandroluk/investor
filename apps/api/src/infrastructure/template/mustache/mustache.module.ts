import {TemplatePort} from '#/domain/_shared/port';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TemplateMustacheAdapter} from './mustache.adapter';
import {TemplateMustacheConfig} from './mustache.config';
import {TemplateMustacheLifecycle} from './mustache.lifecycle';

@EnhancedModule({
  providers: [TemplateMustacheAdapter, TemplateMustacheConfig, TemplateMustacheLifecycle],
  exports: [TemplatePort],
})
export class TemplateMustacheModule {}
