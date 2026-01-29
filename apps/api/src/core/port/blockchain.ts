import {type IConnectable} from '../interface/connectable.interface';

export type BlockchainTransaction = {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  blockNumber: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  input?: string;
  fee?: bigint;
};

export abstract class Blockchain implements IConnectable {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract getBalance(address: string): Promise<bigint>;
  abstract getTokenBalance(address: string, contractAddress: string): Promise<bigint>;
  abstract validateAddress(address: string): boolean;
  abstract getTransaction(hash: string): Promise<BlockchainTransaction | null>;
  abstract getBlockNumber(): Promise<number>;
  abstract watchEvent(address: string, eventName: string, callback: (event: any) => void): void;
}
