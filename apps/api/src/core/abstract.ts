export abstract class Connectable {
  abstract connect(): Promise<void>;
  abstract ping(): Promise<void>;
}
