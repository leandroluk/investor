import {CoinbasePort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(CoinbasePort)
export class CoinbaseFakeAdapter extends CoinbasePort {
  async getPrice(base: string, quote: string): Promise<CoinbasePort.Quote> {
    return {
      base,
      quote,
      price: '2500.00',
      timestamp: new Date(),
      source: 'fake',
    };
  }

  async getPrices(pairs: CoinbasePort.Pair[]): Promise<CoinbasePort.Quote[]> {
    return Promise.all(pairs.map(p => this.getPrice(p.base, p.quote)));
  }

  async getHistoricalPrice(base: string, quote: string, date: Date): Promise<CoinbasePort.Quote> {
    return {
      base,
      quote,
      price: '2400.00',
      timestamp: date,
      source: 'fake',
    };
  }
}
