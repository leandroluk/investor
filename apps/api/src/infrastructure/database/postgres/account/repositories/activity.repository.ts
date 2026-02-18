import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {ActivityEntity as Entity} from '#/domain/account/entities';
import {ActivityRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresActivityRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_activity', {
      id: 'id',
      createdAt: 'created_at',
      action: 'action',
      metadata: 'metadata',
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
}
