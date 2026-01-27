// core/di/decorator.ts
import {type FactoryProvider, type FactoryResolver} from '@/core/di/base';
import {container, type BindingType} from '@/core/di/container';
import {
  FACTORY_METADATA_KEY,
  INJECT_METADATA_KEY,
  RESOLVER_METADATA_KEY,
  SINGLETON_METADATA_KEY,
  TRANSIENT_METADATA_KEY,
  type FactoryMetadata,
  type InjectionMetadata,
  type ResolverMetadata,
} from '@/core/di/metadata';
import 'reflect-metadata';

export function factory<T, Provider extends string>(
  token: abstract new (...args: any[]) => T,
  provider: FactoryProvider,
  resolvers: FactoryResolver<T, Provider>
): ClassDecorator {
  return function (target: any) {
    const metadata: FactoryMetadata = {token};
    Reflect.defineMetadata(FACTORY_METADATA_KEY, metadata, target);
    target.prototype.resolverMap = new Map(Object.entries(resolvers));
    target.prototype.provider = provider;
    container.registerFactory(token, target);
    return target;
  };
}

export function transient<T>(token: abstract new (...args: any[]) => T) {
  return function (target: any): any {
    Reflect.defineMetadata(TRANSIENT_METADATA_KEY, true, target);
    container.registerTransient(token, target);
    return target;
  };
}

export function singleton<T>(token?: abstract new (...args: any[]) => T) {
  return function (target: any): any {
    Reflect.defineMetadata(SINGLETON_METADATA_KEY, true, target);
    container.registerSingleton(token || target, target);
    return target;
  };
}

export function scoped<T>(token: abstract new (...args: any[]) => T) {
  return function (target: any): any {
    container.registerScoped(token, target);
    return target;
  };
}

export function resolver(token: any, bindingType: BindingType = 'singleton'): ClassDecorator {
  return function (target: any) {
    const metadata: ResolverMetadata = {token, bindingType};
    Reflect.defineMetadata(RESOLVER_METADATA_KEY, metadata, target);
    container.registerResolver(token, target, bindingType);
  };
}

export function inject(token: any): ParameterDecorator {
  return function (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) {
    const injections: InjectionMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
    injections.push({index: parameterIndex, token, multiple: false});
    Reflect.defineMetadata(INJECT_METADATA_KEY, injections, target);
  };
}

export function injectAll(token: any): ParameterDecorator {
  return function (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) {
    const injections: InjectionMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
    injections.push({index: parameterIndex, token, multiple: true});
    Reflect.defineMetadata(INJECT_METADATA_KEY, injections, target);
  };
}
