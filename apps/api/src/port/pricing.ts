// port/pricing.ts
export abstract class Pricing {
  /**
   * Gets the current spot price for a pair.
   * @param base The asset to price (e.g., "BTC", "ETH")
   * @param quote The target currency (e.g., "USD", "BRL", "USDT")
   */
  abstract getPrice(base: string, quote: string): Promise<Pricing.Quote>;

  /**
   * Gets multiple prices at once.
   */
  abstract getPrices(pairs: Pricing.Pair[]): Promise<Pricing.Quote[]>;

  /**
   * Gets historical price for a specific point in time.
   */
  abstract getHistoricalPrice(base: string, quote: string, date: Date): Promise<Pricing.Quote>;
}

export namespace Pricing {
  export interface Pair {
    base: string;
    quote: string;
  }

  export interface Quote {
    base: string;
    quote: string;

    /** Price in high precision string format. e.g., "98500.50" or "0.00004321" */
    price: string;

    /** Timestamp of when this price was valid */
    timestamp: Date;

    /** Source of the data */
    source: string;

    /** 24h Change percentage */
    change24h?: string;
  }
}
