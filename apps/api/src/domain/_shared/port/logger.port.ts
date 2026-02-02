export abstract class LoggerPort {
  abstract debug(message: string, meta?: Record<string, any>): void;
  abstract info(message: string, meta?: Record<string, any>): void;
  abstract warn(message: string, meta?: Record<string, any>): void;
  abstract error(message: string, error: Error, meta?: Record<string, any>): void;
}
