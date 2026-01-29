export function Throws(errorConstructor: new (...args: any[]) => Error): ClassDecorator {
  return (target: Function) => {
    for (const propertyName of Object.getOwnPropertyNames(target.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
      const isMethod = descriptor?.value instanceof Function;

      if (!isMethod || propertyName === 'constructor') {
        continue;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]): Promise<any> {
        try {
          return await originalMethod.apply(this, args);
        } catch (error: any) {
          const namedError = new errorConstructor(error.message);
          (namedError as any).cause = error;
          throw namedError;
        }
      };

      Object.defineProperty(target.prototype, propertyName, descriptor);
    }
  };
}
