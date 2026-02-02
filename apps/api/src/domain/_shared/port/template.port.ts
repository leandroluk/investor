export abstract class TemplatePort {
  abstract render<T extends object>(templatePath: string, values: T): Promise<string>;
}
