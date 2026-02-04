import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {ChallengeEntity} from '#/domain/account/entity';
import {ChallengeRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';

const findById = `
  SELECT
    "id",
    "user_id",
    "type",
    "code",
    "status",
    "expires_at",
    "created_at",
    "updated_at"
  FROM "challenge"
  WHERE "id" = $1
`;

const findPendingByUserId = `
  SELECT
    "id",
    "user_id",
    "type",
    "code",
    "status",
    "expires_at",
    "created_at",
    "updated_at"
  FROM "challenge"
  WHERE "user_id" = $1 AND "status" = 'PENDING'
`;

const create = `
  INSERT INTO "challenge" (
    "id",
    "user_id",
    "type",
    "code",
    "status",
    "expires_at",
    "created_at",
    "updated_at"
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
`;

const update = `
  UPDATE "challenge"
  SET
    "status" = $2,
    "updated_at" = $3
  WHERE "id" = $1
`;

@Throws(DatabasePostgresError)
@InjectableExisting(ChallengeRepository)
export class DatabasePostgresChallengeRepository implements ChallengeRepository {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {}

  async findById(id: string): Promise<ChallengeEntity | null> {
    const [row] = await this.database.query(findById, [id]);
    let result: ChallengeEntity | null = null;
    if (row) {
      result = {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        code: row.code,
        status: row.status,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
    return result;
  }

  async findPendingByUserId(userId: string): Promise<ChallengeEntity[]> {
    const rows = await this.database.query(findPendingByUserId, [userId]);
    const result = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      code: row.code,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    return result;
  }

  async create(challenge: ChallengeEntity): Promise<void> {
    await this.database.exec(create, [
      challenge.id,
      challenge.userId,
      challenge.type,
      challenge.code,
      challenge.status,
      challenge.expiresAt,
      challenge.createdAt,
      challenge.updatedAt,
    ]);
  }

  async update(challenge: ChallengeEntity): Promise<void> {
    await this.database.exec(update, [
      challenge.id, //
      challenge.status,
      challenge.updatedAt,
    ]);
  }
}
