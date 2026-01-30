import {Retry, Throws, Trace} from '#/application/_shared/decorator';
import {Coinbase} from '#/domain/_shared/port';
import {Injectable} from '@nestjs/common';
import axios, {AxiosInstance} from 'axios';
import {CoinbaseAxiosConfig} from './axios.config';
import {CoinbaseAxiosError} from './axios.error';

@Throws(CoinbaseAxiosError)
@Injectable()
export class CoinbaseAxiosAdapter implements Coinbase {
  private readonly http: AxiosInstance;

  constructor(private readonly config: CoinbaseAxiosConfig) {
    this.http = axios.create({
      baseURL: this.config.apiUrl,
      headers: this.config.apiKey ? {'x-cg-demo-api-key': this.config.apiKey} : {},
    });
  }

  @Trace()
  @Retry({attempts: 3, delay: 1000})
  async getPrice(base: string, quote: string): Promise<Coinbase.Quote> {
    const {data} = await this.http.get('/simple/price', {
      params: {ids: base, vs_currencies: quote, include_24hr_change: true},
    });

    return {
      base,
      quote,
      price: data[base][quote].toString(),
      change24h: data[base][`${quote}_24h_change`]?.toString(),
      timestamp: new Date(),
      source: 'coingecko',
    };
  }

  @Trace()
  async getPrices(pairs: Coinbase.Pair[]): Promise<Coinbase.Quote[]> {
    return Promise.all(pairs.map(p => this.getPrice(p.base, p.quote)));
  }

  @Trace()
  @Retry({attempts: 2, delay: 2000})
  async getHistoricalPrice(base: string, quote: string, date: Date): Promise<Coinbase.Quote> {
    const formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
    const {data} = await this.http.get(`/coins/${base}/history`, {
      params: {date: formattedDate, localization: false},
    });

    return {
      base,
      quote,
      price: data.market_data.current_price[quote].toString(),
      timestamp: date,
      source: 'coingecko',
    };
  }
}
