// core/di/types.ts
export interface IResolver<T> {
  resolve(): Promise<T> | T;
}

export interface IFactory<T> {
  resolve(): Promise<T> | T;
}
