import {type ApyRangeValueObject} from '#/domain/_shared/value-object';

export class ApySnapshotValueObject {
  private readonly _strategyName: string;
  private readonly _range: ApyRangeValueObject;

  constructor(strategyName: string, range: ApyRangeValueObject) {
    this._strategyName = strategyName;
    this._range = range;
  }

  get strategyName(): string {
    return this._strategyName;
  }
  get range(): ApyRangeValueObject {
    return this._range;
  }
}
