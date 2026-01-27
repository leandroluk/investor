// infrastructure/cryptography/std/error.ts

export class CryptographyStdError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CryptographyStdError';
  }
}
