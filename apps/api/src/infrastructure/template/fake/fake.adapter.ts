import {TemplatePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(TemplatePort)
export class TemplateFakeAdapter extends TemplatePort {
  async render<T extends object>(_templatePath: string, _values: T): Promise<string> {
    return 'template';
  }
}
