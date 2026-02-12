import {Module, type ModuleMetadata} from '@nestjs/common';
import {InjectableExisting} from './injectable-existing.decorator';

export function EnhancedModule(metadata: ModuleMetadata): ClassDecorator {
  const extraProviders = resolveItems(metadata.providers, (token, item) => ({
    provide: token,
    useExisting: item,
  }));

  const extraExports = resolveItems(metadata.exports, token => token);

  return Module({
    ...metadata,
    providers: [...(metadata.providers || []), ...extraProviders],
    exports: [...(metadata.exports || []), ...extraExports],
  });
}

function resolveItems<T>(items: any[] | undefined, factory: (token: any, item: any) => T): T[] {
  if (!items) {
    return [];
  }

  return items.reduce((acc, item) => {
    if (typeof item === 'function') {
      const tokens = InjectableExisting.getMetadata(item);
      if (tokens) {
        for (const token of tokens) {
          acc.push(factory(token, item));
        }
      }
    }
    return acc;
  }, [] as T[]);
}
