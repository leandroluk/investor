export class OidcAxiosError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'OidcAxiosError';
  }
}
