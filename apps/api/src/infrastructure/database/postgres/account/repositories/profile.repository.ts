import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {ProfileEntity as Entity} from '#/domain/account/entities';
import {ProfileRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresProfileRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_profile', {
      id: 'id',
      userId: 'user_id',
      name: 'name',
      phone: 'phone',
      birthdate: 'birthdate',
      language: 'language',
      timezone: 'timezone',
      theme: 'theme',
      twoFactorEnabled: 'two_factor_enabled',
      marketingEmail: 'marketing_email',
      pushNotification: 'push_notification',
      currencyDisplay: 'currency_display',
      updatedAt: 'updated_at',
    });
  }

  async create(entity: Entity): Promise<void> {
    const {cols, places, values} = this.makeInsertOne(entity);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${cols})
       VALUES (${places})`,
      values
    );
  }

  async update(entity: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(entity);
    await this.database.exec(
      `UPDATE "${this.tableName}"
       SET ${setClause}
       WHERE "id" = $1`,
      values
    );
  }

  async findByUserId(userId: string): Promise<Entity | null> {
    const [row] = await this.database.query(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1`,
      [userId]
    );
    return row ?? null;
  }
}
