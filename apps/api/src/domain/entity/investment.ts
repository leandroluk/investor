// domain/entity/investment.ts
export class InvestmentEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {varchar[50]} */ strategyId!: string;
  /** @type {varchar[20]} */ assetId!: string;
  /** @type {decimal[18,2]} */ amountUsd!: number;
  /** @type {decimal[24,18]} */ amountToken!: number;
  /** @type {varchar[20]} */ status!: string;
  /** @type {decimal[18,2]} */ currentValue!: number;
  /** @type {decimal[18,2]} */ totalEarning!: number;
  /** @type {null[char[66]]} */ transactionHash!: string | null;
  /** @type {null[char[66]]} */ withdrawTxHash!: string | null;
  /** @type {varchar[50]} */ frozenStrategyName!: string;
  /** @type {decimal[5,2]} */ frozenApyRangeLow!: number;
  /** @type {decimal[5,2]} */ frozenApyRangeHigh!: number;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {timestamp[3]} */ updatedAt!: Date;
  /** @type {null[timestamp[3]]} */ deletedAt!: Date | null;
  /** @type {null[timestamp[3]]} */ withdrawnAt!: Date | null;
  /** @type {uuidv7} */ userId!: string;
}
