// domain/entity/notification.ts
export class NotificationEntity {
  /** @type {uuidv7} */ id!: string;
  /** @type {varchar[100]} */ title!: string;
  /** @type {text} */ body!: string;
  /** @type {varchar[50]} */ type!: string;
  /** @type {boolean} */ isRead!: boolean;
  /** @type {timestamp[3]} */ createdAt!: Date;
  /** @type {uuidv7} */ userId!: string;
}
