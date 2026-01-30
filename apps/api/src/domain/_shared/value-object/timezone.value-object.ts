export class TimezoneValueObject {
  private readonly _value: string;

  constructor(value: string) {
    try {
      Intl.DateTimeFormat(undefined, {timeZone: value});
      this._value = value;
    } catch {
      throw new Error('INVALID_TIMEZONE');
    }
  }

  get value(): string {
    return this._value;
  }
}
