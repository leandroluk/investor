export abstract class HasherPort {
  abstract hash(plainString: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
