import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {TemplateMustacheAdapter} from './mustache.adapter';
import {TemplateMustacheConfig} from './mustache.config';
import {TemplateMustacheLifecycle} from './mustache.lifecycle';

const providers = [TemplateMustacheAdapter, TemplateMustacheConfig, TemplateMustacheLifecycle];

@EnhancedModule({providers, exports: providers})
export class TemplateMustacheModule {}
