// infrastructure/pricing/coinbase/error.ts
export class PricingCoinbaseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PricingCoinbaseError';
  }
}
