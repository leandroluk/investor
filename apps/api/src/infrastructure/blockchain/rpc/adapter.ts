// infrastructure/blockchain/rpc/adapter.ts
import {canThrow} from '@/core/decorator';
import {Blockchain} from '@/port';
import {ethers} from 'ethers';
import {BlockchainRpcError} from './error';

export interface RpcAdapterConfig {
  readonly url: string;
  readonly chainId: number;
}

export class RpcAdapter implements Blockchain {
  private readonly provider: ethers.JsonRpcProvider;

  constructor(private readonly config: RpcAdapterConfig) {
    this.provider = new ethers.JsonRpcProvider(this.config.url, this.config.chainId);
  }

  @canThrow(BlockchainRpcError)
  async getBalance(address: string): Promise<bigint> {
    const balance = await this.provider.getBalance(address);
    return balance;
  }

  @canThrow(BlockchainRpcError)
  async getTokenBalance(address: string, contractAddress: string): Promise<bigint> {
    const abi = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const balance = await (contract as unknown as {balanceOf: (address: string) => Promise<bigint>}).balanceOf(address);
    return balance;
  }

  @canThrow(BlockchainRpcError)
  validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  @canThrow(BlockchainRpcError)
  async getTransaction(hash: string): Promise<Blockchain.Transaction | null> {
    try {
      const tx = await this.provider.getTransaction(hash);
      if (!tx) {
        return null;
      }

      // Se a transação estiver pendente, blockNumber pode ser null
      if (tx.blockNumber === null) {
        // Retornamos null ou tratamos como pendente dependendo da lógica de negócio.
        // A interface diz "Returns null if not found or pending (depending on strategy)".
        // Aqui retornaremos null se não tiver bloco (pendente).
        return null;
      }

      const receipt = await this.provider.getTransactionReceipt(hash);
      const block = await this.provider.getBlock(tx.blockNumber);

      if (!block || !receipt) {
        return null;
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '', // Contract creation has no 'to'
        value: tx.value,
        blockNumber: tx.blockNumber,
        timestamp: new Date(block.timestamp * 1000), // timestamp in seconds
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        input: tx.data,
        fee: receipt.fee,
      };
    } catch (_error) {
      // ethers lanca erro se formato hash for invalido ou outro erro de rede
      return null;
    }
  }

  @canThrow(BlockchainRpcError)
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }
}
