import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {ChallengeEntity as Entity} from '#/domain/account/entities';
import {ChallengeStatusEnum} from '#/domain/account/enums';
import {ChallengeRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';
import {DatabasePostgresRepository as Repository} from '../postgres.repository';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresChallengeRepository extends Repository<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_challenge', {
      id: 'id',
      userId: 'user_id',
      type: 'type',
      code: 'code',
      status: 'status',
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  }

  async create(challenge: Entity): Promise<void> {
    const {cols: columns, places: placeholders, values} = this.makeInsertOne(challenge);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${columns}) 
       VALUES (${placeholders})`,
      values
    );
  }

  async update(challenge: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(challenge);
    await this.database.exec(
      `UPDATE "${this.tableName}" 
       SET ${setClause} 
       WHERE "id" = $1`,
      values
    );
  }

  async findById(id: string): Promise<Entity | null> {
    const [row] = await this.database.query(
      `SELECT ${this.selectAsPart} 
       FROM "${this.tableName}" 
       WHERE "id" = $1`,
      [id]
    );
    return row ?? null;
  }

  async findPendingByUserId(userId: string): Promise<Entity[]> {
    const rows = await this.database.query(
      `SELECT ${this.selectAsPart} 
       FROM "${this.tableName}" 
       WHERE "user_id" = $1 AND "status" = '${ChallengeStatusEnum.PENDING}'`,
      [userId]
    );
    return rows;
  }
}
