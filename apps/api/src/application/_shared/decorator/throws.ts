import {type applyDecorators} from '@nestjs/common';
import {createHandlerDecorator} from '../factory';

export function Throws(errorConstructor: new (...args: any[]) => Error): ReturnType<typeof applyDecorators> {
  return createHandlerDecorator(async (originalMethod, ...args) => {
    try {
      return await originalMethod(...args);
    } catch (error: any) {
      const namedError = new errorConstructor(error.message);
      (namedError as any).cause = error;
      throw namedError;
    }
  });
}
