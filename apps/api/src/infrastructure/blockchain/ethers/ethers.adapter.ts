import {Retry, Throws, Trace} from '#/application/_shared/decorator';
import {BlockchainPort} from '#/domain/_shared/port';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {FetchRequest, Interface, JsonRpcProvider, isAddress} from 'ethers';
import {BlockchainEthersConfig} from './ethers.config';
import {BlockchainEthersError} from './ethers.error';

@Throws(BlockchainEthersError)
@InjectableExisting(BlockchainPort)
export class BlockchainEthersAdapter implements BlockchainPort {
  private provider: JsonRpcProvider;

  constructor(private readonly config: BlockchainEthersConfig) {
    const request = new FetchRequest(this.config.rpcURL);
    request.timeout = 15000;

    this.provider = new JsonRpcProvider(request, this.config.chainId, {staticNetwork: true});
  }

  async ping(): Promise<void> {
    await this.provider.getBlockNumber();
  }

  async connect(): Promise<void> {
    await this.provider.getNetwork();
  }

  async close(): Promise<void> {
    this.provider.destroy();
  }

  @Trace()
  @Retry({attempts: 3, delay: 500})
  async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }

  @Trace()
  @Retry({attempts: 3, delay: 500})
  async getTokenBalance(address: string, contractAddress: string): Promise<bigint> {
    const abi = ['function balanceOf(address) view returns (uint256)'];
    const iface = new Interface(abi);
    const data = iface.encodeFunctionData('balanceOf', [address]);
    const result = await this.provider.call({to: contractAddress, data});
    return BigInt(result);
  }

  validateAddress(address: string): boolean {
    return isAddress(address);
  }

  @Trace()
  @Retry({attempts: 3, delay: 500})
  async getTransaction(hash: string): Promise<BlockchainPort.Transaction | null> {
    const [tx, receipt] = await Promise.all([
      this.provider.getTransaction(hash),
      this.provider.getTransactionReceipt(hash),
    ]);

    if (!tx) {
      return null;
    }

    const block = tx.blockNumber ? await this.provider.getBlock(tx.blockNumber) : null;

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to!,
      value: tx.value,
      blockNumber: tx.blockNumber ?? 0,
      timestamp: block ? new Date(block.timestamp * 1000) : new Date(),
      status: !receipt ? 'pending' : receipt.status === 1 ? 'confirmed' : 'failed',
      input: tx.data,
      fee: receipt ? BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice ?? 0) : undefined,
    };
  }

  @Trace()
  @Retry({attempts: 3, delay: 500})
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  watchEvent(address: string, eventName: string, callback: (event: any) => void): void {
    const eventFragment = new Interface([`event ${eventName}`]).getEvent(eventName);
    if (!eventFragment) {
      throw new BlockchainEthersError(`Event ${eventName} not found in interface`);
    }
    void this.provider.on({address, topics: [eventFragment.topicHash]}, callback);
  }
}
