// infrastructure/pricing/coinbase/resolver.ts
import {Resolver} from '@/core/di';
import {type Pricing} from '@/port';
import z from 'zod';
import {CoinbaseAdapter} from './adapter';

export class PricingCoinbaseResolver extends Resolver<Pricing> {
  private readonly schema = z.object({
    url: z.string().url().default('https://api.coinbase.com/v2'),
    timeout: z.coerce.number().min(1).default(5000),
  });

  async resolve(): Promise<Pricing> {
    const config = await this.schema.parseAsync({
      url: process.env.API_PRICING_COINBASE_URL ?? 'https://api.coinbase.com/v2',
      timeout: Number(process.env.API_PRICING_COINBASE_TIMEOUT) || 5000,
    });
    return new CoinbaseAdapter(config);
  }
}
