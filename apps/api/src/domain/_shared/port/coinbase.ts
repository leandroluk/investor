export abstract class Coinbase {
  abstract getPrice(base: string, quote: string): Promise<Coinbase.Quote>;
  abstract getPrices(pairs: Coinbase.Pair[]): Promise<Coinbase.Quote[]>;
  abstract getHistoricalPrice(base: string, quote: string, date: Date): Promise<Coinbase.Quote>;
}
export namespace Coinbase {
  export type Pair = {
    base: string;
    quote: string;
  };
  export type Quote = {
    base: string;
    quote: string;
    price: string;
    timestamp: Date;
    source: string;
    change24h?: string;
  };
}
