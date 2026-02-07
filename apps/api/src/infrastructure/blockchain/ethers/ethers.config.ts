import {Injectable} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class BlockchainEthersConfig {
  static readonly schema = z.object({
    rpcURL: z.url().default('https://eth-sepolia.g.alchemy.com/v2/SUA_API_KEY'),
    chainId: z.coerce.number().default(11155111).optional(),
  });

  constructor() {
    Object.assign(
      this,
      BlockchainEthersConfig.schema.parse({
        rpcURL: process.env.API_BLOCKCHAIN_ETHERS_RPC_URL,
        chainId: process.env.API_BLOCKCHAIN_ETHERS_CHAIN_ID,
      })
    );
  }

  readonly rpcURL!: string;
  readonly chainId?: number;
}
