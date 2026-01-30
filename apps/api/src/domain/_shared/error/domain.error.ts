export abstract class DomainError extends Error {
  readonly occurredAt: Date;

  constructor(
    public readonly message: string,
    public readonly code: string
  ) {
    super(message);
    this.occurredAt = new Date();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
