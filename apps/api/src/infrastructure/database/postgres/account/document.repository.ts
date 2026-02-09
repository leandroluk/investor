import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {DocumentEntity as Entity} from '#/domain/account/entities';
import {DocumentStatusEnum} from '#/domain/account/enums';
import {DocumentRepository as Interface} from '#/domain/account/repositories';
import {DocumentView} from '#/domain/account/views';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';
import {DatabasePostgresRepository as Repository} from '../postgres.repository';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresDocumentRepository extends Repository<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_document', {
      id: 'id',
      userId: 'user_id',
      type: 'type',
      storageKey: 'storage_key',
      status: 'status',
      rejectReason: 'reject_reason',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  async create(document: Entity): Promise<void> {
    const {cols, places, values} = this.makeInsertOne(document);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${cols}) 
       VALUES (${places})`,
      values
    );
  }

  async update(document: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(document);
    await this.database.exec(
      `UPDATE "${this.tableName}" 
       SET ${setClause} 
       WHERE "id" = $1`,
      values
    );
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
  async findByUserIdAndType(userId: string, type: string): Promise<Entity | null> {
    const [row] = await this.database.query<Entity>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1 AND "type" = $2
       LIMIT 1`,
      [userId, type]
    );
    return row ?? null;
  }

  async findByUserId(userId: string): Promise<Entity[]> {
    const rows = await this.database.query<Entity>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1`,
      [userId]
    );
    return rows;
  }

  async findByStatus(
    status: DocumentStatusEnum,
    limit: number,
    offset: number
  ): Promise<{items: DocumentView[]; total: number}> {
    const rows = await this.database.query<any>(
      `SELECT id, created_at, updated_at, user_id, type, storage_key, status, reject_reason,
              user_name, user_email, user_kyc_status
       FROM "vw_document"
       WHERE status = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const [count] = await this.database.query<{total: string}>(
      `SELECT COUNT(*) as total
       FROM "vw_document"
       WHERE "status" = $1`,
      [status]
    );

    const items = rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
      type: row.type,
      storageKey: row.storage_key,
      status: row.status,
      rejectReason: row.reject_reason,
      userName: row.user_name,
      userEmail: row.user_email,
      userKycStatus: row.user_kyc_status,
    }));

    return {
      items,
      total: Number(count?.total || 0),
    };
  }
}
