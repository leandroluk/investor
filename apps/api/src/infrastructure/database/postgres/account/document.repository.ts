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
    const [items, [count]] = await Promise.all([
      this.database.query<any>(
        `SELECT
          id as "id",
          created_at as "createdAt",
          updated_at as "updatedAt",
          user_id as "userId",
          type as "type",
          storage_key as "storageKey",
          status as "status",
          reject_reason as "rejectReason",
          user_name as "userName",
          user_email as "userEmail",
          user_kyc_status as "userKycStatus"
         FROM "vw_document"
         WHERE status = $1
         ORDER BY created_at ASC
         LIMIT $2 OFFSET $3`,
        [status, limit, offset]
      ),
      this.database.query<{total: string}>(
        `SELECT COUNT(*) as total
         FROM "vw_document"
         WHERE "status" = $1`,
        [status]
      ),
    ]);

    return {
      items,
      total: Number(count?.total || 0),
    };
  }
}
