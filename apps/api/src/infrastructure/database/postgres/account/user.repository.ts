import {Throws} from '#/application/_shared/decorator';
import {UserEntity} from '#/domain/account/entity';
import {UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresError} from '../postgres.error';

const existsByEmail = `
  SELECT count(*) as "count"
  FROM "user"
  WHERE "email" = $1
`;

const create = `
  INSERT INTO "user" (
    "id", "email", "name", "password_hash", "wallet_address",
    "wallet_verified_at", "status", "two_factor_enabled", "created_at",
    "updated_at"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

@Throws(DatabasePostgresError)
@InjectableExisting(UserRepository)
export class DatabasePostgresUserRepository implements UserRepository {
  constructor(private readonly database: DatabasePostgresAdapter) {}

  async existsByEmail(email: string): Promise<boolean> {
    const [{count}] = await this.database.query(existsByEmail, [email]);
    return count !== 0;
  }

  async create(user: UserEntity): Promise<void> {
    await this.database.exec(create, [
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.walletAddress,
      user.walletVerifiedAt,
      user.status,
      user.twoFactorEnabled,
      user.createdAt,
      user.updatedAt,
    ]);
  }
}
