import {Coinbase, CoinbasePair, CoinbaseQuote} from '#/core/port/coinbase';
import {Injectable} from '@nestjs/common';

@Injectable()
export class CoinbaseFakeAdapter extends Coinbase {
  async getPrice(base: string, quote: string): Promise<CoinbaseQuote> {
    return {
      base,
      quote,
      price: '2500.00',
      timestamp: new Date(),
      source: 'fake',
    };
  }

  async getPrices(pairs: CoinbasePair[]): Promise<CoinbaseQuote[]> {
    return Promise.all(pairs.map(p => this.getPrice(p.base, p.quote)));
  }

  async getHistoricalPrice(base: string, quote: string, date: Date): Promise<CoinbaseQuote> {
    return {
      base,
      quote,
      price: '2400.00',
      timestamp: date,
      source: 'fake',
    };
  }
}
