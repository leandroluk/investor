// infrastructure/pricing/factory.ts
import {factory, Factory} from '@/core/di';
import {Pricing} from '@/port';
import {PricingCoinbaseResolver} from './coinbase';

export enum PricingProvider {
  COINBASE = 'coinbase',
}

@factory(Pricing, (process.env.API_PRICING_PROVIDER ?? PricingProvider.COINBASE) as PricingProvider, {
  [PricingProvider.COINBASE]: PricingCoinbaseResolver,
})
export class PricingFactory extends Factory<Pricing, PricingProvider> {}
