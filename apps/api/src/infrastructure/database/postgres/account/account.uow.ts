import {AccountUOW} from '#/domain/account/uow';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresUOW} from '../postgres.uow';
import {
  DatabasePostgresDocumentRepository,
  DatabasePostgresKycRepository,
  DatabasePostgresProfileRepository,
  DatabasePostgresWalletRepository,
} from './repositories';
import {DatabasePostgresChallengeRepository} from './repositories/challenge.repository';
import {DatabasePostgresDeviceRepository} from './repositories/device.repository';
import {DatabasePostgresLoginRepository} from './repositories/login.repository';
import {DatabasePostgresUserRepository} from './repositories/user.repository';

@InjectableExisting(AccountUOW)
export class DatabasePostgresAccountUOW extends DatabasePostgresUOW<AccountUOW> {
  constructor(database: DatabasePostgresAdapter) {
    super(database, tx => ({
      challenge: new DatabasePostgresChallengeRepository(tx),
      device: new DatabasePostgresDeviceRepository(tx),
      document: new DatabasePostgresDocumentRepository(tx),
      kyc: new DatabasePostgresKycRepository(tx),
      login: new DatabasePostgresLoginRepository(tx),
      user: new DatabasePostgresUserRepository(tx),
      profile: new DatabasePostgresProfileRepository(tx),
      wallet: new DatabasePostgresWalletRepository(tx),
    }));
  }
}
