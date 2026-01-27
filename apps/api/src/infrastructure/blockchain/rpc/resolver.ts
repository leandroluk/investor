// infrastructure/blockchain/rpc/resolver.ts
import {Resolver} from '@/core/di';
import {type Blockchain} from '@/port';
import z from 'zod';
import {RpcAdapter} from './adapter';

export class BlockchainRpcResolver extends Resolver<Blockchain> {
  private readonly schema = z.object({
    url: z.string().url(),
    chainId: z.coerce.number().int().positive(),
  });

  async resolve(): Promise<Blockchain> {
    const config = await this.schema.parseAsync({
      url: process.env.API_BLOCKCHAIN_RPC_URL,
      chainId: process.env.API_BLOCKCHAIN_RPC_CHAIN_ID,
    });
    return new RpcAdapter(config);
  }
}
