import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {KycEntity as Entity} from '#/domain/account/entities';
import {KycRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresKycRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_kyc', {
      id: 'id',
      userId: 'user_id',
      status: 'status',
      level: 'level',
      verifiedAt: 'verified_at',
      internalNote: 'internal_note',
      riskScore: 'risk_score',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  async create(kyc: Entity): Promise<void> {
    const {cols, places, values} = this.makeInsertOne(kyc);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${cols})
       VALUES (${places})`,
      values
    );
  }

  async update(kyc: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(kyc);
    await this.database.exec(
      `UPDATE "${this.tableName}"
       SET ${setClause}
       WHERE "id" = $1`,
      values
    );
  }

  async findByUserId(userId: string): Promise<Entity | null> {
    const [row] = await this.database.query<Entity>(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1`,
      [userId]
    );
    return row ?? null;
  }
}
