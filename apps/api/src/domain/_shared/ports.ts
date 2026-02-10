import {type UserEntity} from '../account/entities';
import {type DomainEvent} from './events';

// #region BlockchainPort
export abstract class BlockchainPort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract getBalance(address: string): Promise<bigint>;
  abstract getTokenBalance(address: string, contractAddress: string): Promise<bigint>;
  abstract validateAddress(address: string): boolean;
  abstract getTransaction(hash: string): Promise<BlockchainPort.Transaction | null>;
  abstract getBlockNumber(): Promise<number>;
  abstract watchEvent(address: string, eventName: string, callback: (event: any) => void): void;
}
export namespace BlockchainPort {
  export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: bigint;
    blockNumber: number;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
    input?: string;
    fee?: bigint;
  }
}
// #endregion

// #region BrokerPort
export abstract class BrokerPort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract publish<TPayload extends object = any>(event: DomainEvent<TPayload>): Promise<void>;
  abstract subscribe(...topics: string[]): Promise<void>;
  abstract consume<TPayload extends object = any>(handler: (event: DomainEvent<TPayload>) => void): Promise<void>;
}
// #endregion

// #region CachePort
export abstract class CachePort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract set<TType = any>(key: string, value: TType, ttl?: number): Promise<void>;
  abstract get<TType = any>(pattern: string): Promise<{key: string; value: TType | null}>;
  abstract delete(...patterns: string[]): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
}
// #endregion

// #region CipherPort
export abstract class CipherPort {
  abstract encrypt<TType = any>(plain: TType, iv?: string): string;
  abstract decrypt<TType = any>(cipher: string): TType;
}
// #endregion

// #region CoinbasePort
export abstract class CoinbasePort {
  abstract getPrice(base: string, quote: string): Promise<CoinbasePort.Quote>;
  abstract getPrices(pairs: CoinbasePort.Pair[]): Promise<CoinbasePort.Quote[]>;
  abstract getHistoricalPrice(base: string, quote: string, date: Date): Promise<CoinbasePort.Quote>;
}
export namespace CoinbasePort {
  export interface Pair {
    base: string;
    quote: string;
  }
  export interface Quote {
    base: string;
    quote: string;
    price: string;
    timestamp: Date;
    source: string;
    change24h?: string;
  }
}
// #endregion

// #region DatabasePort
export abstract class DatabasePort {
  abstract ping(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
  abstract exec(sql: string, params?: any[]): Promise<DatabasePort.Result>;
  abstract transaction<TResult = any>(handler: (tx: DatabasePort.Transaction) => Promise<TResult>): Promise<TResult>;
}
export namespace DatabasePort {
  export interface Result {
    rowsAffected: number;
    lastInsertId?: string | number | null;
  }
  export interface Transaction {
    query<TType = any>(sql: string, params?: any[]): Promise<TType[]>;
    exec(sql: string, params?: any[]): Promise<Result>;
  }
}
// #endregion

// #region HasherPort
export abstract class HasherPort {
  abstract hash(plainString: string): string;
  abstract compare(plain: string, hash: string): boolean;
}
// #endregion

// #region LoggerPort
export abstract class LoggerPort {
  abstract debug(message: string, meta?: Record<string, any>): void;
  abstract info(message: string, meta?: Record<string, any>): void;
  abstract warn(message: string, meta?: Record<string, any>): void;
  abstract error(message: string, error: Error, meta?: Record<string, any>): void;
}
// #endregion

// #region MailerPort
export abstract class MailerPort {
  abstract send(message: MailerPort.Message): Promise<void>;
}
export namespace MailerPort {
  export interface Attachment {
    filename: string;
    contentType: string;
    content: Buffer;
  }
  export interface Message {
    to: string[];
    from?: string;
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }
}
// #endregion

// #region OidcPort
export abstract class OidcPort {
  abstract getAdapter(provider: 'microsoft' | 'google'): OidcPort.Adapter;

  encodeState(state: OidcPort.State): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  }

  decodeState(base64State: string): OidcPort.State {
    return JSON.parse(Buffer.from(base64State, 'base64url').toString('utf8'));
  }
}
export namespace OidcPort {
  export interface State {
    callbackURL: string;
    provider: string;
  }
  export interface Claims {
    subject: string;
    email: string;
    givenName: string;
    familyName: string;
    custom: Record<string, any>;
  }
  export interface Tokens {
    accessToken: string;
    refreshToken: string;
  }
  export interface Adapter {
    getAuthURL(base64State: string): string;
    exchange(code: string): Promise<Tokens>;
    getToken(refreshToken: string): Promise<Tokens>;
    getInfo(accessToken: string): Promise<Claims>;
  }
}
// #endregion

// #region StoragePort
export abstract class StoragePort {
  abstract save(path: string, file: Buffer, mimeType: string): Promise<string>;
  abstract get(path: string): Promise<Buffer>;
  abstract delete(path: string): Promise<void>;
  abstract getSignedURL(path: string, expires: number, mode: 'read' | 'write'): Promise<string>;
}
// #endregion

// #region TemplatePort
export abstract class TemplatePort {
  abstract render<T extends object>(templatePath: string, values: T): Promise<string>;
}
// #endregion

// #region TokenPort
export abstract class TokenPort {
  abstract create<T extends boolean>(data: TokenPort.CreateData<T>): TokenPort.CreateReturn<T>;
  abstract decode(token: string): TokenPort.Decoded;
}
export namespace TokenPort {
  export type CreateData<T extends boolean> = {
    sessionKey: string;
    claims: TokenPort.Claims;
    complete?: T;
  };
  export type CreateReturn<T extends boolean> = T extends true
    ? Required<TokenPort.Authorization>
    : TokenPort.Authorization;

  export interface Claims {
    id: UserEntity['id'];
    email: UserEntity['email'];
    name: UserEntity['name'];
    language: UserEntity['language'];
    timezone: UserEntity['timezone'];
    hash: string;
  }
  export interface Authorization {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken?: string;
  }
  export interface Decoded {
    kind: 'access' | 'refresh';
    sessionKey: string;
    claims: Claims;
  }
}
// #endregion
