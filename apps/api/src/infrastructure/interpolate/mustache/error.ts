// infrastructure/interpolate/mustache/error.ts
export class InterpolateMustacheError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'InterpolateMustacheError';
  }
}
