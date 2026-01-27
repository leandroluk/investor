// core/type.ts
export type Constructor<T> = new (...args: any[]) => T;

export type Token<T = any> = abstract new (...args: any[]) => T;
