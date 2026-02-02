import {DynamicModule, Module} from '@nestjs/common';
import {makeDynamicEnvModule} from '../_shared/factory';
import {TemplateFakeModule} from './fake';
import {TemplateMustacheModule} from './mustache';

@Module({})
export class TemplateModule {
  static forRoot(): DynamicModule {
    return makeDynamicEnvModule(TemplateModule, {
      envVar: 'API_TEMPLATE_PROVIDER',
      envSelectedProvider: 'mustache',
      envProviderMap: {mustache: TemplateMustacheModule, fake: TemplateFakeModule},
      global: true,
    });
  }
}
