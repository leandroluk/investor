export abstract class CoinbasePort {
  abstract getPrice(base: string, quote: string): Promise<CoinbasePort.Quote>;
  abstract getPrices(pairs: CoinbasePort.Pair[]): Promise<CoinbasePort.Quote[]>;
  abstract getHistoricalPrice(base: string, quote: string, date: Date): Promise<CoinbasePort.Quote>;
}
export namespace CoinbasePort {
  export interface Pair {
    base: string;
    quote: string;
  }
  export interface Quote {
    base: string;
    quote: string;
    price: string;
    timestamp: Date;
    source: string;
    change24h?: string;
  }
}
