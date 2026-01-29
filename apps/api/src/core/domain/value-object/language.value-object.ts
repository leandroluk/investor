export class LanguageValueObject {
  private readonly _value: string;
  private readonly _allowed = ['pt', 'en', 'es'];

  constructor(value: string) {
    const normalized = value.toLowerCase().trim();
    if (!this._allowed.includes(normalized)) {
      throw new Error('UNSUPPORTED_LANGUAGE');
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }
}
