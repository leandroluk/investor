export abstract class CipherPort {
  abstract encrypt<TType = any>(plain: TType, iv?: string): string;
  abstract decrypt<TType = any>(cipher: string): TType;
}
