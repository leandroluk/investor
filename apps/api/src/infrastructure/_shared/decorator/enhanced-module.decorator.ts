import {Module, type ModuleMetadata} from '@nestjs/common';
import {InjectableExisting} from './injectable-existing.decorator';

export function EnhancedModule(metadata: ModuleMetadata): ClassDecorator {
  const processedMetadata = {...metadata};

  if (metadata.providers) {
    const additionalProviders: any[] = [];

    for (const provider of metadata.providers) {
      if (typeof provider === 'function') {
        const token = InjectableExisting.getMetadata(provider);
        if (token) {
          additionalProviders.push({provide: token, useExisting: provider});
        }
      }
    }

    processedMetadata.providers = [...metadata.providers, ...additionalProviders];
  }

  return Module(processedMetadata);
}
