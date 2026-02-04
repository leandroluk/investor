import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {UserEntity} from '#/domain/account/entity';
import {UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';

const existsByEmail = `
  SELECT count(*) as "count"
  FROM "user"
  WHERE "email" = $1
`;

const findByEmail = `
  SELECT
    "id",
    "email",
    "name",
    "password_hash",
    "wallet_address",
    "wallet_verified_at",
    "wallet_seed_encrypted",
    "kyc_status",
    "kyc_verified_at",
    "status",
    "two_factor_enabled",
    "language",
    "timezone",
    "created_at",
    "updated_at"
  FROM "user"
  WHERE "email" = $1
`;

const findById = `
  SELECT
    "id",
    "email",
    "name",
    "password_hash",
    "wallet_address",
    "wallet_verified_at",
    "wallet_seed_encrypted",
    "kyc_status",
    "kyc_verified_at",
    "status",
    "two_factor_enabled",
    "language",
    "timezone",
    "created_at",
    "updated_at"
  FROM "user"
  WHERE "id" = $1
`;

const create = `
  INSERT INTO "user" (
    "id",
    "email",
    "name",
    "password_hash",
    "wallet_address",
    "wallet_verified_at",
    "wallet_seed_encrypted",
    "kyc_status",
    "kyc_verified_at",
    "status",
    "two_factor_enabled",
    "language",
    "timezone",
    "created_at",
    "updated_at"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
`;

const update = `
  UPDATE "user"
  SET
    "email" = $2,
    "name" = $3,
    "password_hash" = $4,
    "wallet_address" = $5,
    "wallet_verified_at" = $6,
    "wallet_seed_encrypted" = $7,
    "kyc_status" = $8,
    "kyc_verified_at" = $9,
    "status" = $10,
    "two_factor_enabled" = $11,
    "language" = $12,
    "timezone" = $13,
    "updated_at" = $14
  WHERE "id" = $1
`;

@Throws(DatabasePostgresError)
@InjectableExisting(UserRepository)
export class DatabasePostgresUserRepository implements UserRepository {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {}

  async existsByEmail(email: string): Promise<boolean> {
    const [{count}] = await this.database.query(existsByEmail, [email]);
    return count !== 0;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const [row] = await this.database.query(findByEmail, [email]);
    if (row) {
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        walletAddress: row.wallet_address,
        walletVerifiedAt: row.wallet_verified_at,
        walletSeedEncrypted: row.wallet_seed_encrypted,
        kycStatus: row.kyc_status,
        kycVerifiedAt: row.kyc_verified_at,
        status: row.status,
        twoFactorEnabled: row.two_factor_enabled,
        language: row.language,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
    return null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const [row] = await this.database.query(findById, [id]);
    if (row) {
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.password_hash,
        walletAddress: row.wallet_address,
        walletVerifiedAt: row.wallet_verified_at,
        walletSeedEncrypted: row.wallet_seed_encrypted,
        kycStatus: row.kyc_status,
        kycVerifiedAt: row.kyc_verified_at,
        status: row.status,
        twoFactorEnabled: row.two_factor_enabled,
        language: row.language,
        timezone: row.timezone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
    return null;
  }

  async create(user: UserEntity): Promise<void> {
    await this.database.exec(create, [
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.walletAddress,
      user.walletVerifiedAt,
      user.walletSeedEncrypted,
      user.kycStatus,
      user.kycVerifiedAt,
      user.status,
      user.twoFactorEnabled,
      user.language,
      user.timezone,
      user.createdAt,
      user.updatedAt,
    ]);
  }

  async update(user: UserEntity): Promise<void> {
    await this.database.exec(update, [
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.walletAddress,
      user.walletVerifiedAt,
      user.walletSeedEncrypted,
      user.kycStatus,
      user.kycVerifiedAt,
      user.status,
      user.twoFactorEnabled,
      user.language,
      user.timezone,
      user.updatedAt,
    ]);
  }
}
