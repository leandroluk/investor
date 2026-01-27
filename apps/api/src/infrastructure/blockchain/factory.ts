// infrastructure/blockchain/factory.ts
import {factory, Factory} from '@/core/di';
import {Blockchain} from '@/port';
import {BlockchainRpcResolver} from './rpc/resolver';

export enum BlockchainProvider {
  RPC = 'rpc',
}

@factory(Blockchain, (process.env.API_BLOCKCHAIN_PROVIDER ?? BlockchainProvider.RPC) as BlockchainProvider, {
  [BlockchainProvider.RPC]: BlockchainRpcResolver,
})
export class BlockchainFactory extends Factory<Blockchain, BlockchainProvider> {}
