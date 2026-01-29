export class SymbolValueObject {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.toUpperCase().trim();
    if (!/^[A-Z0-9]{2,10}$/.test(normalized)) {
      throw new Error('INVALID_ASSET_SYMBOL');
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }
}
