export class EmailValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }
    this._value = value.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }
}
