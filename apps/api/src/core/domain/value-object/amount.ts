export class AmountValueObject {
  private readonly _value: bigint;
  private readonly _decimals: number;

  constructor(value: string | number | bigint, decimals = 18) {
    this._decimals = decimals;
    if (typeof value === 'bigint') {
      this._value = value;
    } else {
      this._value = BigInt(Math.floor(Number(value) * Math.pow(10, decimals)));
    }
  }

  get value(): bigint {
    return this._value;
  }
  get decimals(): number {
    return this._decimals;
  }

  toFormat(fractionDigits = 2): string {
    return (Number(this._value) / Math.pow(10, this._decimals)).toFixed(fractionDigits);
  }
}
