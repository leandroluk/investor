import {type applyDecorators} from '@nestjs/common';
import {type EventEmitter2} from '@nestjs/event-emitter';
import {createHandlerDecorator} from './factories';

// #region Retry
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
// #endregion

// #region Throws
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
// #endregion

// #region Trace
export function Trace(sufix?: string): ClassDecorator & MethodDecorator {
  return createHandlerDecorator(function (this: any, originalMethod, methodName, ...args) {
    const start = performance.now();
    const emit = (): void => {
      const eventEmitter = (global as any).eventEmitter as EventEmitter2;

      if (eventEmitter) {
        eventEmitter.emit(['monitor.trace', sufix].filter(Boolean).join('.'), {
          className: this.constructor.name,
          methodName: methodName,
          duration: performance.now() - start,
          timestamp: new Date(),
        });
      }
    };

    try {
      const result = originalMethod.apply(this, args);
      if (result instanceof Promise) {
        return result.finally(() => emit());
      }
      emit();
      return result;
    } catch (error) {
      emit();
      throw error;
    }
  });
}
// #endregion
