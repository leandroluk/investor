import {type EventEmitter2} from '@nestjs/event-emitter';
import {createHandlerDecorator} from '../factory';

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
