import {Throws} from '#/application/_shared/decorator';
import {Database} from '#/domain/_shared/port';
import {UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresError} from '../../postgres.error';

const existsByEmail = `
  SELECT count(*) as "count"
  FROM "user"
  WHERE "email" = $1
`;

@Throws(DatabasePostgresError)
@InjectableExisting(UserRepository)
export class DatabasePostgresUserRepository implements UserRepository {
  constructor(private readonly database: Database) {}

  async existsByEmail(email: string): Promise<boolean> {
    const [{count}] = await this.database.query(existsByEmail, [email]);
    return count !== 0;
  }
}
