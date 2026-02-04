import {Throws} from '#/application/_shared/decorator';
import {DatabasePort} from '#/domain/_shared/port';
import {LoginEntity} from '#/domain/account/entity';
import {LoginRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresError} from '../postgres.error';

const create = `
  INSERT INTO "login" (
    "id",
    "ip",
    "success",
    "user_id",
    "created_at"
  ) VALUES ($1, $2, $3, $4, $5)
`;

@Throws(DatabasePostgresError)
@InjectableExisting(LoginRepository)
export class DatabasePostgresLoginRepository implements LoginRepository {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {}

  async create(login: LoginEntity): Promise<void> {
    await this.database.exec(create, [
      login.id, //
      login.ip,
      login.success,
      login.userId,
      login.createdAt,
    ]);
  }
}
