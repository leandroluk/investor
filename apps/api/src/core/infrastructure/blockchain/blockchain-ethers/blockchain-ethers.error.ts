export class BlockchainEthersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockchainEthersError';
  }
}
