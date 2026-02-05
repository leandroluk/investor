import {type applyDecorators} from '@nestjs/common';
import {createHandlerDecorator} from '../factory';

export function Throws(errorConstructor: new (...args: any[]) => Error): ReturnType<typeof applyDecorators> {
  return createHandlerDecorator((originalMethod, _methodName, ...args) => {
    try {
      const result = originalMethod(...args);
      if (result instanceof Promise) {
        return result.catch(error => {
          const namedError = new errorConstructor(error.message);
          (namedError as any).cause = error;
          throw namedError;
        });
      }
      return result;
    } catch (error: any) {
      const namedError = new errorConstructor(error.message);
      (namedError as any).cause = error;
      throw namedError;
    }
  });
}
