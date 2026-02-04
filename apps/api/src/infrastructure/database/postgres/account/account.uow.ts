import {AccountUOW} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresUOW} from '../postgres.uow';
import {DatabasePostgresChallengeRepository} from './challenge.repository';
import {DatabasePostgresDeviceRepository} from './device.repository';
import {DatabasePostgresLoginRepository} from './login.repository';
import {DatabasePostgresUserRepository} from './user.repository';

@InjectableExisting(AccountUOW)
export class DatabasePostgresAccountUOW extends DatabasePostgresUOW<AccountUOW> {
  constructor(database: DatabasePostgresAdapter) {
    super(database, tx => ({
      challenge: new DatabasePostgresChallengeRepository(tx),
      device: new DatabasePostgresDeviceRepository(tx),
      login: new DatabasePostgresLoginRepository(tx),
      user: new DatabasePostgresUserRepository(tx),
    }));
  }
}
