export class PushTokenValueObject {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length < 10) {
      throw new Error('INVALID_PUSH_TOKEN');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }
}
