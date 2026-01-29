import {type EventEmitter2} from '@nestjs/event-emitter';

export function Trace(): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<any> {
      const start = performance.now();
      try {
        return await originalMethod.apply(this, args);
      } finally {
        const eventEmitter = (global as any).eventEmitter as EventEmitter2;
        if (eventEmitter) {
          eventEmitter.emit('monitor.trace', {
            className: target.constructor.name,
            methodName: String(propertyKey),
            duration: performance.now() - start,
            timestamp: new Date(),
          });
        }
      }
    };
  };
}
