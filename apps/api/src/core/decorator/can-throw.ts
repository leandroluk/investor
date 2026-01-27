// core/decorator/can-throw.ts
import {type Constructor} from '@/core/type';

export function canThrow(resolver: ((e: any) => Error) | Constructor<Error>) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<unknown> {
      return Promise.resolve(originalMethod.apply(this, args)).catch((error: Error) => {
        throw (resolver.prototype?.constructor === resolver && resolver.prototype instanceof Error) ||
          resolver === Error
          ? new (resolver as Constructor<Error>)(error)
          : (resolver as (e: any) => Error)(error);
      });
    };
    return descriptor;
  };
}
