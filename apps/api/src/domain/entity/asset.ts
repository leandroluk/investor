// domain/entity/asset.ts
export class AssetEntity {
  /** @type {varchar[20]} */ id!: string;
  /** @type {varchar[10]} */ symbol!: string;
  /** @type {varchar[20]} */ network!: string;
  /** @type {null[char[42]]} */ contractAddress!: string | null;
  /** @type {smallint} */ decimals!: number;
  /** @type {boolean} */ isActive!: boolean;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {timestamp[3]} */ updatedAt!: Date;
}
