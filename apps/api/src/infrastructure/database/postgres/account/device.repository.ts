import {Throws} from '#/application/_shared/decorator';
import {DeviceRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresAdapter} from '../postgres.adapter';
import {DatabasePostgresError} from '../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(DeviceRepository)
export class DatabasePostgresDeviceRepository implements DeviceRepository {
  constructor(private readonly database: DatabasePostgresAdapter) {}
}
