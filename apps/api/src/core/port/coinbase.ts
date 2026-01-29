export type CoinbasePair = {
  base: string;
  quote: string;
};

export type CoinbaseQuote = {
  base: string;
  quote: string;
  price: string;
  timestamp: Date;
  source: string;
  change24h?: string;
};

export abstract class Coinbase {
  abstract getPrice(base: string, quote: string): Promise<CoinbaseQuote>;
  abstract getPrices(pairs: CoinbasePair[]): Promise<CoinbaseQuote[]>;
  abstract getHistoricalPrice(base: string, quote: string, date: Date): Promise<CoinbaseQuote>;
}
