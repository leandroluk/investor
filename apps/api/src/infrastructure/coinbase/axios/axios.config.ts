import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class CoinbaseAxiosConfig {
  static readonly schema = z.object({
    apiURL: z.url().default('https://api.coingecko.com/api/v3'),
    apiKey: z.string().optional(),
  });

  constructor() {
    Object.assign(
      this,
      CoinbaseAxiosConfig.schema.parse({
        apiURL: process.env.API_COINBASE_AXIOS_URL,
        apiKey: process.env.API_COINBASE_AXIOS_TIMEOUT,
      })
    );
  }

  readonly apiURL!: string;
  readonly apiKey?: string;
}
