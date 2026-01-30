import {Coinbase} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(Coinbase)
export class CoinbaseFakeAdapter extends Coinbase {
  async getPrice(base: string, quote: string): Promise<Coinbase.Quote> {
    return {
      base,
      quote,
      price: '2500.00',
      timestamp: new Date(),
      source: 'fake',
    };
  }

  async getPrices(pairs: Coinbase.Pair[]): Promise<Coinbase.Quote[]> {
    return Promise.all(pairs.map(p => this.getPrice(p.base, p.quote)));
  }

  async getHistoricalPrice(base: string, quote: string, date: Date): Promise<Coinbase.Quote> {
    return {
      base,
      quote,
      price: '2400.00',
      timestamp: date,
      source: 'fake',
    };
  }
}
