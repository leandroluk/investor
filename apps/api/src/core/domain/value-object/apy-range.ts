export class ApyRangeValueObject {
  private readonly _low: number;
  private readonly _high: number;

  constructor(low: number, high: number) {
    if (low < 0 || high < low) {
      throw new Error('INVALID_APY_RANGE');
    }
    this._low = low;
    this._high = high;
  }

  get low(): number {
    return this._low;
  }
  get high(): number {
    return this._high;
  }
}
