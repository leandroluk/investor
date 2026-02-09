import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {LoginEntity as Entity} from '#/domain/account/entities';
import {LoginRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';
import {DatabasePostgresRepository as Repository} from '../postgres.repository';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresLoginRepository extends Repository<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_login', {
      id: 'id',
      createdAt: 'created_at',
      userId: 'user_id',
      ip: 'ip',
      success: 'success',
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
