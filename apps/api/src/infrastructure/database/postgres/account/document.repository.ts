import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {DocumentEntity as Entity} from '#/domain/account/entity';
import {DocumentRepository as Interface} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';
import {DatabasePostgresRepository as Repository} from '../postgres.repository';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresDocumentRepository extends Repository<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('document', {
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
}
