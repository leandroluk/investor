// infrastructure/blockchain/rpc/error.ts
export class BlockchainRpcError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'BlockchainRpcError';
  }
}
