import {Injectable, type ScopeOptions, type Type} from '@nestjs/common';

function decorator(tokenOrTokens: any | any[], options?: ScopeOptions): <C extends Type<any>>(target: C) => void {
  return <C extends Type<any>>(target: C) => {
    const tokens = [].concat(tokenOrTokens);
    Reflect.defineMetadata(InjectableExisting.KEY, {tokens}, target);
    Injectable(options)(target);
  };
}

export const InjectableExisting = Object.assign(decorator, {
  KEY: Symbol('InjectableExisting'),
  getMetadata(target: Type<any>): Type<any>[] | undefined {
    return Reflect.getMetadata(InjectableExisting.KEY, target)?.tokens;
  },
});
