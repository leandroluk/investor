// domain/entity/system-config.ts
export class SystemConfigEntity {
  /** @type {varchar[100]} */ key!: string;
  /** @type {text} */ value!: string;
  /** @type {null[varchar[255]]} */ description!: string | null;
  /** @type {timestamp[3]} */ updatedAt!: Date;
}
