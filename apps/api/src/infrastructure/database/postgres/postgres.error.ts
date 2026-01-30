export class DatabasePostgresError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabasePostgresError';
  }
}
