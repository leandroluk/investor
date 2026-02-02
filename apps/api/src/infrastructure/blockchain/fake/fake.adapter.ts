import {BlockchainPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(BlockchainPort)
export class BlockchainFakeAdapter extends BlockchainPort {
  async ping(): Promise<void> {
    return;
  }

  async connect(): Promise<void> {
    return;
  }

  async close(): Promise<void> {
    return;
  }

  async getBalance(_address: string): Promise<bigint> {
    return BigInt(1000000000000000000);
  }

  async getBlockNumber(): Promise<number> {
    return 123456;
  }

  async getTokenBalance(_address: string, _contractAddress: string): Promise<bigint> {
    return BigInt(500000000000000000000n);
  }

  validateAddress(_address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(_address);
  }

  async getTransaction(_hash: string): Promise<BlockchainPort.Transaction | null> {
    return {
      hash: _hash,
      from: '0x1234567890123456789012345678901234567890',
      to: '0x0987654321098765432109876543210987654321',
      value: BigInt(1000000000000000000),
      blockNumber: 123456,
      timestamp: new Date(),
      status: 'pending',
    };
  }

  watchEvent(_address: string, _eventName: string, callback: (event: any) => void): void {
    console.log(`[Fake] Watching event ${_eventName} on ${_address}`, {context: 'BlockchainFake'});
    setTimeout(() => callback({transactionHash: '0xabc123', event: _eventName, data: {}}), 5000);
  }
}
