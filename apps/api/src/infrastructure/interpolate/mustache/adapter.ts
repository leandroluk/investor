// infrastructure/interpolate/mustache/adapter.ts
import {canThrow} from '@/core/decorator';
import {Renderer} from '@/port';
import fs from 'fs';
import Mustache from 'mustache';
import path from 'node:path';
import {InterpolateMustacheError} from './error';

export interface MustacheAdapterConfig {
  readonly path: string;
}

export class MustacheAdapter implements Renderer {
  private readonly templateCache = new Map<string, string>();

  constructor(private readonly config: MustacheAdapterConfig) {
    const templatePath = path.join(process.cwd(), this.config.path);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template path does not exist: ${templatePath}`);
    }
    const templateFiles = fs.readdirSync(templatePath);
    for (const templateFile of templateFiles) {
      const template = fs.readFileSync(path.join(templatePath, templateFile), 'utf-8');
      this.templateCache.set(templateFile, template);
    }
  }

  @canThrow(InterpolateMustacheError)
  render(template: string, variables: Record<string, any>): string {
    const templateContent = this.templateCache.get(template);
    if (!templateContent) {
      throw new Error(`Template ${template} not found`);
    }
    return Mustache.render(templateContent, variables);
  }
}
