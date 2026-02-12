import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {LoginEntity as Entity} from '#/domain/account/entities';
import {LoginRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresLoginRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_login', {
      id: 'id',
      createdAt: 'created_at',
      userId: 'user_id',
      deviceId: 'device_id',
      ip: 'ip',
      strategy: 'strategy',
      success: 'success',
      failureReason: 'failure_reason',
    });
  }

  async create(login: Entity): Promise<void> {
    const {cols: columns, places: placeholders, values} = this.makeInsertOne(login);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${columns}) 
       VALUES (${placeholders})`,
      values
    );
  }
}
