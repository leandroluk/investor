export class PasswordValueObject {
  private readonly _value: string;
  private readonly _isHashed: boolean;

  constructor(value: string, isHashed = false) {
    if (!isHashed && value.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    this._value = value;
    this._isHashed = isHashed;
  }

  get value(): string {
    return this._value;
  }
  get isHashed(): boolean {
    return this._isHashed;
  }
}
