// infrastructure/_shared/factory/dynamic-env-module.factory.ts
import {type DynamicModule, type Type} from '@nestjs/common';

export function makeDynamicEnvModule<K extends string, TProviders extends Record<K, Type<any>>>(
  moduleClass: Type<any>,
  config: {
    envVar: string;
    envSelectedProvider: K;
    envProviderMap: TProviders;
    providers?: Type<any>[];
    imports?: Type<any>[];
    exports?: Type<any>[];
    global?: boolean;
  }
): DynamicModule {
  const {
    envVar,
    envSelectedProvider,
    envProviderMap,
    providers = [],
    imports = [],
    exports = [],
    global = true,
  } = config;

  const selectedProviderKey = (process.env[envVar] || envSelectedProvider) as K;
  const selectedModule = envProviderMap[selectedProviderKey];

  if (!selectedModule) {
    const availableProviders = Object.keys(envProviderMap).join(', ');
    throw new TypeError(`Invalid provider '${selectedProviderKey}' for ${envVar}. Available: ${availableProviders}`);
  }

  return {
    global,
    module: moduleClass,
    providers,
    imports: [selectedModule, ...imports],
    exports: [selectedModule, ...exports],
  };
}
