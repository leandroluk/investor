export abstract class Hasher {
  abstract hash(plainString: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
