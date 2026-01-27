// domain/entity/user.ts
export class UserEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {timestamp[3]} */ updatedAt!: Date;
  /** @type {null[timestamp[3]]} */ deletedAt!: Date | null;
  /** @type {varchar[255]} */ email!: string;
  /** @type {varchar[255]} */ passwordHash!: string;
  /** @type {varchar[100]} */ name!: string;
  /** @type {null[char[42]]} */ walletAddress!: string | null;
  /** @type {varchar[20]} */ status!: string;
  /** @type {boolean} */ twoFactorEnabled!: boolean;
  /** @type {null[varchar[32]]} */ twoFactorSecret!: string | null;
  /** @type {null[timestamp]} */ blockedUntil!: Date | null;
}
