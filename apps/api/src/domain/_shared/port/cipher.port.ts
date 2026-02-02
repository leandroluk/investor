export abstract class CipherPort {
  abstract encrypt<TType = any>(plain: TType, iv?: string): Promise<string>;
  abstract decrypt<TType = any>(cipher: string): Promise<TType>;
}
