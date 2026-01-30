export class S3CompatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'S3CompatError';
  }
}
