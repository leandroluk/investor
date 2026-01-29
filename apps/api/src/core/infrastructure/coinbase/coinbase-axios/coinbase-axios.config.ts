import {Injectable} from '@nestjs/common';
import {z} from 'zod';

@Injectable()
export class CoinbaseAxiosConfig {
  static readonly schema = z.object({
    apiUrl: z.url().default('https://api.coingecko.com/api/v3'),
    apiKey: z.string().optional(),
  });

  constructor() {
    Object.assign(
      this,
      CoinbaseAxiosConfig.schema.parse({
        apiUrl: process.env.API_COINBASE_AXIOS_URL,
        apiKey: process.env.API_COINBASE_AXIOS_TIMEOUT,
      })
    );
  }

  readonly apiUrl!: string;
  readonly apiKey?: string;
}
