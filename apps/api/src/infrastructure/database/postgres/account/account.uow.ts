import {AccountUOW, DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresUOW} from '../postgres.uow';

@InjectableExisting(AccountUOW)
export class DatabasePostgresAccountUOW extends DatabasePostgresUOW<{
  readonly device: DeviceRepository;
  readonly login: LoginRepository;
  readonly user: UserRepository;
}> {
  constructor(
    database: DatabasePostgresAdapter,
    device: DeviceRepository,
    login: LoginRepository,
    user: UserRepository
  ) {
    super(database, {device, login, user});
  }
}
