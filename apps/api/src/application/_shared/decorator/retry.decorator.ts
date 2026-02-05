import {createHandlerDecorator} from '../factory';

export function Retry({attempts, delay = 1000}: {attempts: number; delay?: number}): ClassDecorator & MethodDecorator {
  return createHandlerDecorator((originalMethod, _methodName, ...args) => {
    let lastError: any;
    try {
      const result = originalMethod(...args);
      if (result instanceof Promise) {
        return (async (): Promise<any> => {
          try {
            return await result;
          } catch (e) {
            lastError = e;
            for (let i = 1; i < attempts; i++) {
              try {
                if (i < attempts) {
                  await new Promise(res => setTimeout(res, delay));
                }
                return await originalMethod(...args);
              } catch (err) {
                lastError = err;
              }
            }
            throw lastError;
          }
        })();
      }
      return result;
    } catch (error) {
      lastError = error;
      for (let i = 1; i < attempts; i++) {
        try {
          return originalMethod(...args);
        } catch (err) {
          lastError = err;
        }
      }
      throw lastError;
    }
  });
}
