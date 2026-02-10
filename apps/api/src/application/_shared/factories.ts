export function createHandlerDecorator(
  handler: (originalMethod: any, methodName: string, ...args: any[]) => any
): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any => {
    if (descriptor) {
      const originalMethod = descriptor.value;
      const methodName = propertyKey?.toString() || '';

      descriptor.value = function (...args: any[]): any {
        return handler.call(this, originalMethod.bind(this), methodName, ...args);
      };
      return descriptor;
    }

    for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
      const methodDescriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
      const isMethod = typeof methodDescriptor?.value === 'function';

      if (!isMethod || propertyName === 'constructor') {
        continue;
      }

      const originalMethod = methodDescriptor.value;
      methodDescriptor.value = function (...args: any[]): any {
        return handler.call(this, originalMethod.bind(this), propertyName, ...args);
      };

      Object.defineProperty(target.prototype, propertyName, methodDescriptor);
    }
  };
}
