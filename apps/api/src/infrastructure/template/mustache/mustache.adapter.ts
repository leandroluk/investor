import {Throws} from '#/application/_shared/decorator';
import {TemplatePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import Mustache from 'mustache';
import fs from 'node:fs';
import path from 'node:path';
import {TemplateMustacheConfig} from './mustache.config';
import {TemplateMustacheError} from './mustache.error';

@Throws(TemplateMustacheError)
@InjectableExisting(TemplatePort)
export class TemplateMustacheAdapter implements TemplatePort {
  private readonly templateMap = new Map<string, string>();

  constructor(private readonly templateMustacheConfig: TemplateMustacheConfig) {}

  async render<T extends object>(templatePath: string, values: T): Promise<string> {
    const template = this.templateMap.get(templatePath);
    if (!template) {
      throw new TemplateMustacheError(`Template not found: ${templatePath}`);
    }
    return Mustache.render(template, values);
  }

  async load(): Promise<void> {
    const fullPath = path.resolve(process.cwd(), this.templateMustacheConfig.path);
    try {
      await fs.promises.access(fullPath);
    } catch {
      throw new TemplateMustacheError(`Template not found: ${fullPath}`);
    }
    const templateFiles = await fs.promises.readdir(fullPath);
    for (const templateFile of templateFiles) {
      const templatePath = path.join(fullPath, templateFile);
      const template = await fs.promises.readFile(templatePath, 'utf-8');
      this.templateMap.set(templateFile, template);
    }
  }
}
