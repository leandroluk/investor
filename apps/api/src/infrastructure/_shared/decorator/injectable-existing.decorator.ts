import {Injectable, type Abstract, type ScopeOptions, type Type} from '@nestjs/common';

type Token = string | symbol | Type<any> | Abstract<any>;

function decorator(tokenOrTokens: Token, options?: ScopeOptions): <C extends Type<any>>(target: C) => void {
  return <C extends Type<any>>(target: C) => {
    const tokens = [tokenOrTokens].flat();
    Reflect.defineMetadata(InjectableExisting.KEY, {tokens}, target);
    Injectable(options)(target);
  };
}

export const InjectableExisting = Object.assign(decorator, {
  KEY: Symbol('InjectableExisting'),
  getMetadata(target: Token): Token[] | undefined {
    return Reflect.getMetadata(InjectableExisting.KEY, target)?.tokens;
  },
});
