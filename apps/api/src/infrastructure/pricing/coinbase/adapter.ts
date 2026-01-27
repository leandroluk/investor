// infrastructure/pricing/coinbase/adapter.ts
import {canThrow} from '@/core/decorator';
import {Pricing} from '@/port';
import {PricingCoinbaseError} from './error';

interface CoinbaseSpotResponse {
  data: {
    base: string;
    currency: string;
    amount: string;
  };
}

export interface CoinbaseAdapterConfig {
  readonly url: string;
  readonly timeout: number;
}

export class CoinbaseAdapter implements Pricing {
  constructor(private readonly config: CoinbaseAdapterConfig) {}

  @canThrow(PricingCoinbaseError)
  async getPrice(base: string, quote: string): Promise<Pricing.Quote> {
    const pair = `${base}-${quote}`;
    const url = `${this.config.url}/prices/${pair}/spot`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as CoinbaseSpotResponse;

      return {
        base: json.data.base,
        quote: json.data.currency,
        price: json.data.amount,
        timestamp: new Date(), // Coinbase spot price is "current"
        source: 'coinbase',
      };
    } catch (error) {
      throw new Error(`Failed to fetch price for ${pair}: ${(error as Error).message}`);
    }
  }

  @canThrow(PricingCoinbaseError)
  async getPrices(pairs: Pricing.Pair[]): Promise<Pricing.Quote[]> {
    // Coinbase v2 public API is one-by-one for spot prices
    return Promise.all(pairs.map(pair => this.getPrice(pair.base, pair.quote)));
  }

  @canThrow(PricingCoinbaseError)
  async getHistoricalPrice(base: string, quote: string, date: Date): Promise<Pricing.Quote> {
    const pair = `${base}-${quote}`;
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const url = `${this.config.url}/prices/${pair}/spot?date=${dateStr}`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Coinbase API error: ${response.status} ${response.statusText}`);
      }

      const json = (await response.json()) as CoinbaseSpotResponse;

      return {
        base: json.data.base,
        quote: json.data.currency,
        price: json.data.amount,
        timestamp: date,
        source: 'coinbase',
      };
    } catch (error) {
      throw new Error(`Failed to fetch historical price for ${pair} at ${dateStr}: ${(error as Error).message}`);
    }
  }
}
