// port/blockchain.ts
export abstract class Blockchain {
  /**
   * Retrieves the native balance of a wallet (e.g., ETH, SOL).
   * Returns value in smallest unit (Wei, Lamports).
   */
  abstract getBalance(address: string): Promise<bigint>;

  /**
   * Retrieves the balance of a specific token (ERC20, SPL).
   * Returns value in smallest unit based on token decimals.
   */
  abstract getTokenBalance(address: string, contractAddress: string): Promise<bigint>;

  /**
   * Validates if the string is a valid address format for this chain.
   */
  abstract validateAddress(address: string): boolean;

  /**
   * Fetches transaction details by hash.
   * Returns null if not found or pending (depending on strategy).
   */
  abstract getTransaction(hash: string): Promise<Blockchain.Transaction | null>;

  /**
   * Gets the current block number (useful for sync checks).
   */
  abstract getBlockNumber(): Promise<number>;
}

export namespace Blockchain {
  export type ChainId = number | string; // e.g., 1 (Mainnet), 11155111 (Sepolia)

  export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

  export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: bigint; // Native value sent
    blockNumber: number;
    timestamp: Date;
    status: TransactionStatus;

    // Optional: for token transfers, input data might be parsed here
    input?: string;
    fee?: bigint;
  }
}
