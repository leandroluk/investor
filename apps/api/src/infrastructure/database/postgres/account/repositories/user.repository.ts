import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {UserEntity as Entity} from '#/domain/account/entities';
import {UserRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresUserRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_user', {
      id: 'id',
      email: 'email',
      passwordHash: 'password_hash', // NOSONAR
      role: 'role',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    });
  }

  async create(user: Entity): Promise<void> {
    const {cols: columns, places: placeholders, values} = this.makeInsertOne(user);
    await this.database.exec(
      `INSERT INTO "${this.tableName}" (${columns}) 
       VALUES (${placeholders})`,
      values
    );
  }

  async update(user: Entity): Promise<void> {
    const {setClause, values} = this.makeUpdate(user);
    await this.database.exec(
      `UPDATE "${this.tableName}"
       SET ${setClause}
       WHERE "id" = $1`,
      values
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const [{count}] = await this.database.query(
      `SELECT count(*) as "count"
       FROM "${this.tableName}"
       WHERE "email" = $1`,
      [email]
    );
    return count !== 0;
  }

  async findByEmail(email: string): Promise<Entity | null> {
    const [row] = await this.database.query(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "email" = $1`,
      [email]
    );
    return row ?? null;
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

  async getEmailById(id: string): Promise<Entity['email'] | null> {
    const [row] = await this.database.query(
      `SELECT "email"
       FROM "${this.tableName}"
       WHERE "id" = $1`,
      [id]
    );
    return row?.email ?? null;
  }
}
