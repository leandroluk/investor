export abstract class HasherPort {
  abstract hash(plainString: string): string;
  abstract compare(plain: string, hash: string): boolean;
}
