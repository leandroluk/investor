import {Database} from '#/domain/_shared/port';
import {AccountUnitOfWork} from '#/domain/account/account.unit-of-work';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabaseUnitOfWork} from '../postgres.unit-of-work';

type Session = {
  device: DeviceRepository;
  login: LoginRepository;
  user: UserRepository;
};

@InjectableExisting(AccountUnitOfWork)
export class DatabasePostgresAccountUnitOfWork extends DatabaseUnitOfWork<Session> {
  constructor(
    database: Database, //
    device: DeviceRepository,
    login: LoginRepository,
    user: UserRepository
  ) {
    super(database, {device, login, user});
  }
}
