// port/logger.ts
export abstract class Logger {
  /**
   * Registers a debug message.
   * @param message The log message.
   * @param meta Optional object with additional fields.
   */
  abstract debug(message: string, meta?: Record<string, any>): void;

  /**
   * Registers an informational message.
   */
  abstract info(message: string, meta?: Record<string, any>): void;

  /**
   * Registers a warning message.
   */
  abstract warn(message: string, meta?: Record<string, any>): void;

  /**
   * Registers an error message.
   * @param message The error description.
   * @param err The Error object.
   * @param meta Optional additional fields.
   */
  abstract error(message: string, err: Error, meta?: Record<string, any>): void;

  /**
   * Creates a child logger with additional persistent fields.
   */
  abstract child(meta: Record<string, any>): Logger;
}
