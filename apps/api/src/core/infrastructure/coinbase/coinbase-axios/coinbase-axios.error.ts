export class CoinbaseAxiosError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CoinbaseAxiosError';
  }
}
