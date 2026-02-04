import {createHandlerDecorator} from '../factory';

export function Retry({attempts, delay = 1000}: {attempts: number; delay?: number}): ClassDecorator & MethodDecorator {
  return createHandlerDecorator(async (originalMethod, _methodName, ...args) => {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await originalMethod(...args);
        return result;
      } catch (error) {
        lastError = error;
        if (i < attempts - 1) {
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  });
}
