import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {WalletEntity as Entity} from '#/domain/account/entities';
import {WalletRepository as Interface} from '#/domain/account/repositories';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresWalletRepository extends DAO<Entity> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('tb_wallet', {
      id: 'id',
      userId: 'user_id',
      name: 'name',
      network: 'network',
      address: 'address',
      seedEncrypted: 'seed_encrypted',
      isCustodial: 'is_custodial',
      isActive: 'is_active',
      verifiedAt: 'verified_at',
      createdAt: 'created_at',
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

  async findById(id: string): Promise<Entity | null> {
    const [row] = await this.database.query(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "id" = $1`,
      [id]
    );
    return row ?? null;
  }

  async findByAddress(address: string): Promise<Entity | null> {
    const [row] = await this.database.query(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "address" = $1`,
      [address]
    );
    return row ?? null;
  }

  async listByUserId(userId: string): Promise<Entity[]> {
    return this.database.query(
      `SELECT ${this.selectAsPart}
       FROM "${this.tableName}"
       WHERE "user_id" = $1
       ORDER BY "created_at" ASC`,
      [userId]
    );
  }
}
