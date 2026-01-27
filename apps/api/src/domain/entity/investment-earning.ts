// domain/entity/investment-earning.ts
export class InvestmentEarningEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {timestamp[3]} */ recordedAt!: Date;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {decimal[18,6]} */ amount!: number;
  /** @type {decimal[5,2]} */ apyAtTime!: number;
  /** @type {uuidv7} */ investmentId!: string;
}
