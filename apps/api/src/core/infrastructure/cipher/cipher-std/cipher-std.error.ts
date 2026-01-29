export class CipherStdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CipherStdError';
  }
}
