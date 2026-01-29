import {type IPingable} from './pingable.interface';

export type IConnectable = IPingable & {
  connect(): Promise<void>;
  close(): Promise<void>;
};
