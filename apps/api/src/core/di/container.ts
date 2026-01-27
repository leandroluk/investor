// core/di/container.ts
import 'reflect-metadata';
import {type Constructor, type Token} from '../type';
import {INJECT_METADATA_KEY, type InjectionMetadata} from './metadata';
import {type IResolver} from './types';

export type BindingType = 'singleton' | 'scoped' | 'transient' | 'resolver' | 'instance' | 'factory';

interface Binding<T> {
  type: BindingType;
  value: T | Constructor<T> | Constructor<IResolver<T>>;
  singletonCache?: T;
}

export class Container {
  private bindings = new Map<any, Binding<any>>();
  private scopedInstances = new Map<any, any>();
  private parent?: Container;

  private constructor(parent?: Container) {
    this.parent = parent;
  }

  static create(): Container {
    return new Container();
  }

  createScope(): Container {
    return new Container(this);
  }

  registerFactory<T = any>(token: Token<T>, factoryClass: Constructor<T>): this {
    this.bindings.set(token, {
      type: 'factory',
      value: factoryClass,
    });
    return this;
  }

  registerResolver<T>(token: Token<T>, resolverClass: Constructor<IResolver<T>>, bindingType: BindingType): this {
    this.bindings.set(token, {type: bindingType, value: resolverClass});
    return this;
  }

  registerSingleton<T>(token: Token<T>, implementation: Constructor<T>): this {
    this.bindings.set(token, {
      type: 'singleton',
      value: implementation,
    });
    return this;
  }

  registerScoped<T>(token: Token<T>, implementation: Constructor<T>): this {
    this.bindings.set(token, {
      type: 'scoped',
      value: implementation,
    });
    return this;
  }

  registerTransient<T>(token: Token<T>, implementation: Constructor<T>): this {
    this.bindings.set(token, {type: 'transient', value: implementation});
    return this;
  }

  registerInstance<T>(token: Token<T>, instance: T): this {
    this.bindings.set(token, {type: 'instance', value: instance});
    return this;
  }

  private getBinding<T>(token: Token<T>): Binding<T> | undefined {
    if (this.bindings.has(token)) {
      return this.bindings.get(token);
    }

    if (this.parent) {
      return this.parent.getBinding(token);
    }

    return undefined;
  }

  async resolve<T>(token: Token<T>): Promise<T> {
    const binding = this.getBinding(token);

    if (!binding) {
      throw new Error(`No binding found for ${token.name}`);
    }

    switch (binding.type) {
      case 'instance':
        return binding.value as T;

      case 'resolver': {
        if (!binding.singletonCache) {
          const resolverClass = binding.value as Constructor<IResolver<T>>;
          const args = await this.resolveDependencies(resolverClass);
          const resolver = new resolverClass(...args);
          binding.singletonCache = await resolver.resolve();
        }
        return binding.singletonCache;
      }

      case 'factory': {
        const factoryClass = binding.value as Constructor<any>;
        const args = await this.resolveDependencies(factoryClass);
        const factory = new factoryClass(...args);
        return await factory.resolve();
      }

      case 'singleton':
        if (!binding.singletonCache) {
          const implementation = binding.value as Constructor<T>;
          const args = await this.resolveDependencies(implementation);
          binding.singletonCache = new implementation(...args);
        }
        return binding.singletonCache;

      case 'scoped': {
        if (this.scopedInstances.has(token)) {
          return this.scopedInstances.get(token)!;
        }
        const implementation = binding.value as Constructor<T>;
        const args = await this.resolveDependencies(implementation);
        const instance = new implementation(...args);
        this.scopedInstances.set(token, instance);
        return instance;
      }

      case 'transient': {
        const implementation = binding.value as Constructor<T>;
        const args = await this.resolveDependencies(implementation);
        return new implementation(...args);
      }
    }
  }

  async resolveAll<T>(token: Token<T>): Promise<T[]> {
    const instances: T[] = [];
    const allBindings = new Map<any, Binding<any>>();

    let current: Container | undefined = this; // eslint-disable-line @typescript-eslint/no-this-alias
    while (current) {
      for (const [key, value] of current.bindings) {
        if (!allBindings.has(key)) {
          allBindings.set(key, value);
        }
      }
      current = current.parent;
    }

    for (const [key] of allBindings.entries()) {
      if (key === token) {
        const instance = await this.resolve(token);
        instances.push(instance as T);
        continue;
      }

      try {
        if (key.prototype instanceof token) {
          const instance = await this.resolve(key);
          instances.push(instance as T);
        }
      } catch {
        // no need catch it
      }
    }

    return instances;
  }

  private async resolveDependencies(target: Constructor<any>): Promise<any[]> {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    const injections: InjectionMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];

    const args: any[] = [];

    for (const [index, paramType] of paramTypes.entries()) {
      const injection = injections.find(i => i.index === index);

      if (injection) {
        if (injection.multiple) {
          args.push(await this.resolveAll(injection.token));
        } else {
          args.push(await this.resolve(injection.token));
        }
      } else if (paramType) {
        args.push(await this.resolve(paramType));
      } else {
        args.push(undefined);
      }
    }

    return args;
  }
}

export const container = Container.create();
