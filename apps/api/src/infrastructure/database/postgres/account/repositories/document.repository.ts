import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {DocumentEntity as Entity} from '#/domain/account/entities';
import {DocumentRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresDocumentRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_document', {
      id: 'id',
      userId: 'user_id',
      kycId: 'kyc_id',
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
       WHERE "user_id" = $1
       ORDER BY "updated_at" DESC`,
      [userId]
    );
    return rows;
  }

  async findByStatus(status: string, limit: number, offset: number): Promise<{items: Entity[]; total: number}> {
    const [totalRow] = await this.database.query<{count: string}>(
      `SELECT COUNT(*) as count
       FROM "${this.tableName}"
       WHERE "status" = $1`,
      [status]
    );

    const items = await this.database.query<Entity>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "status" = $1
       ORDER BY "created_at" ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    return {
      items,
      total: Number(totalRow?.count ?? 0),
    };
  }
}
