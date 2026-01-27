// domain/entity/strategy.ts
export class StrategyEntity {
  /** @type {varchar[50]} */ id!: string;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {timestamp[3]} */ updatedAt!: Date;
  /** @type {null[timestamp]} */ deletedAt!: Date | null;
  /** @type {text} */ description!: string;
  /** @type {decimal[5,2]} */ expectedApyRangeLow!: number;
  /** @type {decimal[5,2]} */ expectedApyRangeHigh!: number;
}
