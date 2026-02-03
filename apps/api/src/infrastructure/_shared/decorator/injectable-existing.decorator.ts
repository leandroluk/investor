import {Injectable, type ScopeOptions, type Type} from '@nestjs/common';

function decorator<T>(
  token: (new (...args: any[]) => T) | (abstract new (...args: any[]) => T),
  options?: ScopeOptions
): <C extends Type<T>>(target: C) => void {
  return <C extends Type<T>>(target: C) => {
    Reflect.defineMetadata(InjectableExisting.KEY, {token}, target);
    Injectable(options)(target);
  };
}

export const InjectableExisting = Object.assign(decorator, {
  KEY: Symbol('InjectableExisting'),
  getMetadata(target: Type<any>): Type<any> | undefined {
    return Reflect.getMetadata(InjectableExisting.KEY, target)?.token;
  },
});
