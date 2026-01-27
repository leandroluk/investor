// infrastructure/jwt/jose/error.ts
export class JwtJoseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'JwtJoseError';
  }
}
