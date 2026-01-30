import {Database} from '#/domain/_shared/port';
import {AccountUnitOfWork} from '#/domain/account/account.unit-of-work';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repository';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAccountUnitOfWork} from './account/account.unit-of-work';
import {
  DatabasePostgresDeviceRepository,
  DatabasePostgresLoginRepository,
  DatabasePostgresUserRepository,
} from './account/repository';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresLifecycle} from './postgres.lifecycle';

@EnhancedModule({
  providers: [
    DatabasePostgresAdapter,
    DatabasePostgresConfig,
    DatabasePostgresLifecycle,
    DatabasePostgresDeviceRepository,
    DatabasePostgresLoginRepository,
    DatabasePostgresUserRepository,
    DatabasePostgresAccountUnitOfWork,
  ],
  exports: [Database, DeviceRepository, LoginRepository, UserRepository, AccountUnitOfWork],
})
export class DatabasePostgresModule {}
