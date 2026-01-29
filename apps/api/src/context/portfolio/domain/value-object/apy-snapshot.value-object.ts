import {type ApyRangeValueObject} from '#/core/domain/value-object/apy-range';

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
