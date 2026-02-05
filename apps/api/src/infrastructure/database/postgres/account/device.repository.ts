import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {DeviceEntity} from '#/domain/account/entity';
import {DeviceRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
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
    "name",
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
    "name",
    "created_at",
    "updated_at"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

const update = `
  UPDATE "device" SET
    "is_active" = $1,
    "brand" = $2,
    "model" = $3,
    "name" = $4,
    "updated_at" = $5
  WHERE "id" = $6
`;

const findById = `
  SELECT
    "id",
    "user_id",
    "platform",
    "fingerprint",
    "is_active",
    "brand",
    "model",
    "name",
    "created_at",
    "updated_at"
  FROM "device"
  WHERE "id" = $1
`;

const listActiveByUserId = `
  SELECT
    "id",
    "user_id",
    "platform",
    "fingerprint",
    "is_active",
    "brand",
    "model",
    "name",
    "created_at",
    "updated_at"
  FROM "device"
  WHERE "user_id" = $1 AND "is_active" = true
`;

const listFingerprintByUserId = `
  SELECT "fingerprint"
  FROM "device"
  WHERE "user_id" = $1 AND "is_active" = true
`;

@Throws(DatabasePostgresError)
@InjectableExisting(DeviceRepository)
export class DatabasePostgresDeviceRepository implements DeviceRepository {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {}

  async create(device: DeviceEntity): Promise<void> {
    await this.database.exec(create, [
      device.id,
      device.userId,
      device.platform,
      device.fingerprint,
      device.isActive,
      device.brand,
      device.model,
      device.name,
      device.createdAt,
      device.updatedAt,
    ]);
  }

  async update(device: DeviceEntity): Promise<void> {
    await this.database.exec(update, [
      device.isActive, //
      device.brand,
      device.model,
      device.name,
      device.updatedAt,
      device.id,
    ]);
  }

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
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(id: string): Promise<DeviceEntity | null> {
    const [row] = await this.database.query<any>(findById, [id]);
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
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listActiveByUserId(userId: string): Promise<DeviceEntity[]> {
    const rows = await this.database.query<any>(listActiveByUserId, [userId]);
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      platform: row.platform,
      fingerprint: row.fingerprint,
      isActive: row.is_active,
      brand: row.brand,
      model: row.model,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listFingerprintByUserId(userId: string): Promise<Array<DeviceEntity['fingerprint']>> {
    const rows = await this.database.query<any>(listFingerprintByUserId, [userId]);
    return rows.map(row => row.fingerprint);
  }
}
