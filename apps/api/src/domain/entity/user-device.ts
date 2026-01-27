// domain/entity/user-device.ts
export class UserDeviceEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {varchar[20]} */ platform!: string;
  /** @type {varchar[255]} */ pushToken!: string;
  /** @type {null[varchar[100]]} */ deviceModel!: string | null;
  /** @type {null[varchar[20]]} */ appVersion!: string | null;
  /** @type {boolean} */ isActive!: boolean;
  /** @type {timestamp[3]} */ lastActiveAt!: Date;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {uuidv7} */ userId!: string;
}
