// infrastructure/logger/json/error.ts
export class LoggerJsonError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'LoggerJsonError';
  }
}
