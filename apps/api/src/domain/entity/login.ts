// domain/entity/login.ts
export class LoginEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {timestamp[3]} */ timestamp!: Date;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {inet} */ ip!: string;
  /** @type {null[varchar[100]]} */ location!: string | null;
  /** @type {null[varchar[100]]} */ device!: string | null;
  /** @type {boolean} */ success!: boolean;
  /** @type {uuidv7} */ userId!: string;
}
