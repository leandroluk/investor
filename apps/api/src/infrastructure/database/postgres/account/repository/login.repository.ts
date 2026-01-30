import {Throws} from '#/application/_shared/decorator';
import {Database} from '#/domain/_shared/port';
import {LoginRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(LoginRepository)
export class DatabasePostgresLoginRepository implements LoginRepository {
  constructor(private readonly database: Database) {}
}
