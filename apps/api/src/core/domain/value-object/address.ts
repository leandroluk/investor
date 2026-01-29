export class AddressValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      throw new Error('INVALID_BLOCKCHAIN_ADDRESS');
    }
    this._value = value.toLowerCase();
  }

  get value(): string {
    return this._value;
  }
}
