import {Throws} from '#/application/_shared/decorator';
import {Database} from '#/domain/_shared/port';
import {DeviceRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(DeviceRepository)
export class DatabasePostgresDeviceRepository implements DeviceRepository {
  constructor(private readonly database: Database) {}
}
