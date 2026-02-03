import {Throws} from '#/application/_shared/decorator';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresError} from '../postgres.error';

const findByFingerprint = `
  SELECT
    "id",
    "user_id",
    "platform",
    "fingerprint",
    "is_active",
    "brand",
    "model",
    "created_at",
    "updated_at"
  FROM "device"
  WHERE "user_id" = $1 AND "fingerprint" = $2
`;

const create = `
  INSERT INTO "device" (
    "id",
    "user_id",
    "platform",
    "fingerprint",
    "is_active",
    "brand",
    "model",
    "created_at",
    "updated_at"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`;

const update = `
  UPDATE "device" SET
    "is_active" = $1,
    "brand" = $2,
    "model" = $3,
    "updated_at" = $4
  WHERE "id" = $5
`;

@Throws(DatabasePostgresError)
@InjectableExisting(DeviceRepository)
export class DatabasePostgresDeviceRepository implements DeviceRepository {
  constructor(private readonly database: DatabasePostgresAdapter) {}

  async findByFingerprint(userId: string, fingerprint: string): Promise<DeviceEntity | null> {
    const [row] = await this.database.query<any>(findByFingerprint, [userId, fingerprint]);
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      platform: row.platform,
      fingerprint: row.fingerprint,
      isActive: row.is_active,
      brand: row.brand,
      model: row.model,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(device: DeviceEntity): Promise<void> {
    await this.database.query(create, [
      device.id,
      device.userId,
      device.platform,
      device.fingerprint,
      device.isActive,
      device.brand,
      device.model,
      device.createdAt,
      device.updatedAt,
    ]);
  }

  async update(device: DeviceEntity): Promise<void> {
    await this.database.query(update, [
      device.isActive, //
      device.brand,
      device.model,
      device.updatedAt,
      device.id,
    ]);
  }
}
