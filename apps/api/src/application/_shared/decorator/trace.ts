import {type EventEmitter2} from '@nestjs/event-emitter';
import {createHandlerDecorator} from '../factory';

export function Trace(sufix?: string): ClassDecorator & MethodDecorator {
  return createHandlerDecorator(async function (this: any, originalMethod, ...args) {
    const start = performance.now();

    try {
      return await originalMethod(...args);
    } finally {
      const eventEmitter = (global as any).eventEmitter as EventEmitter2;

      if (eventEmitter) {
        eventEmitter.emit(['monitor.trace', sufix].filter(Boolean).join('.'), {
          className: this.constructor.name,
          methodName: originalMethod.name.replace('bound ', ''),
          duration: performance.now() - start,
          timestamp: new Date(),
        });
      }
    }
  });
}
