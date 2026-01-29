import {type EventEmitter2} from '@nestjs/event-emitter';

export interface RetryOptions {
  attempts: number;
  delay?: number;
}

export function Retry({attempts, delay = 1000}: RetryOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      let lastError: any;

      for (let attempt = 0; attempt < attempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt < attempts - 1 && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const eventEmitter = (globalThis as any).eventEmitter as EventEmitter2;
          if (eventEmitter) {
            eventEmitter.emit('monitor.retry', {
              className: target.constructor.name,
              methodName: String(propertyKey),
              error,
              attempt: attempt,
            });
          }
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}
