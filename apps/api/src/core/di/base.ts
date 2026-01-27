// core/di/base.ts
import {type IFactory, type IResolver} from './types';

export abstract class Resolver<T> implements IResolver<T> {
  abstract resolve(): Promise<T>;
}

export abstract class Factory<T, Provider extends string = string> implements IFactory<T> {
  protected readonly resolverMap!: Map<Provider, new () => Resolver<T>>;
  protected readonly provider!: (() => Promise<Provider>) | (() => Provider) | Provider;

  async resolve(): Promise<T> {
    const provider = this.provider instanceof Function ? await this.provider() : this.provider;
    const ResolverClass = this.resolverMap.get(provider);
    if (!ResolverClass) {
      throw new Error(
        `Unsupported provider: ${provider}. Available: ${Array.from(this.resolverMap.keys()).join(', ')}`
      );
    }

    const resolver = new ResolverClass();
    return await resolver.resolve();
  }
}

export type FactoryProvider = (() => Promise<string>) | (() => string) | string;
export type FactoryResolver<T, Provider extends string> = Record<Provider, new () => Resolver<T>>;
