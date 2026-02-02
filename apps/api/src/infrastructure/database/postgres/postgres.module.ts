import {DatabasePort} from '#/domain/_shared/port';
import {DeviceRepository, LoginRepository, UserRepository} from '#/domain/account/repository';
import {AccountUOW} from '#/domain/account/repository/account.uow';
import {EnhancedModule} from '#/infrastructure/_shared/decorator';
import * as account from './account';
import {DatabasePostgresAdapter} from './postgres.adapter';
import {DatabasePostgresConfig} from './postgres.config';
import {DatabasePostgresLifecycle} from './postgres.lifecycle';

@EnhancedModule({
  providers: Array().concat(
    DatabasePostgresAdapter,
    DatabasePostgresConfig,
    DatabasePostgresLifecycle,
    Object.values(account)
  ),
  exports: [DatabasePort, DeviceRepository, LoginRepository, UserRepository, AccountUOW],
})
export class DatabasePostgresModule {}
