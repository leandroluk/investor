import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {DeviceEntity as Entity} from '#/domain/account/entity';
import {DeviceRepository as Interface} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';
import {DatabasePostgresRepository as Repository} from '../postgres.repository';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresDeviceRepository extends Repository<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('device', {
      id: 'id',
      userId: 'user_id',
      platform: 'platform',
      fingerprint: 'fingerprint',
      isActive: 'is_active',
      brand: 'brand',
      model: 'model',
      name: 'name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  async create(device: Entity): Promise<void> {
    const {cols, places, values} = this.makeInsertOne(device);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${cols}) 
       VALUES (${places})`,
      values
    );
  }

  async update(device: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(device);
    await this.database.exec(
      `UPDATE "${this.tableName}" 
       SET ${setClause} 
       WHERE "id" = $1`,
      values
    );
  }

  async findByFingerprint(userId: string, fingerprint: string): Promise<Entity | null> {
    const [row] = await this.database.query<any>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1 AND "fingerprint" = $2`,
      [userId, fingerprint]
    );
    return row ?? null;
  }

  async findById(id: string): Promise<Entity | null> {
    const [row] = await this.database.query<any>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "id" = $1`,
      [id]
    );
    return row ?? null;
  }

  async listActiveByUserId(userId: string): Promise<Entity[]> {
    const rows = await this.database.query<any>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1 AND "is_active" = true`,
      [userId]
    );
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

  async listFingerprintByUserId(userId: string): Promise<Array<Entity['fingerprint']>> {
    const rows = await this.database.query<any>(
      `SELECT "fingerprint"
       FROM "device"
       WHERE "user_id" = $1 AND "is_active" = true`,
      [userId]
    );
    return rows.map(row => row.fingerprint);
  }
}
