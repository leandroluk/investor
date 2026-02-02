import {Throws} from '#/application/_shared/decorator';
import {LoginRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresError} from '../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(LoginRepository)
export class DatabasePostgresLoginRepository implements LoginRepository {
  constructor(private readonly database: DatabasePostgresAdapter) {}
}
