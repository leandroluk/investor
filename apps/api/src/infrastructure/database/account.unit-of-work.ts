import {type Database} from '#/domain/_shared/port';
import {AccountUnitOfWork} from '#/domain/account/account.unit-of-work';
import {type DeviceRepository, type LoginRepository, type UserRepository} from '#/domain/account/repository';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';

@InjectableExisting(AccountUnitOfWork)
export class DatabaseAccountUnitOfWork implements AccountUnitOfWork {
  constructor(
    private readonly database: Database,
    private readonly deviceRepository: DeviceRepository,
    private readonly loginRepository: LoginRepository,
    private readonly userRepository: UserRepository
  ) {}

  async transaction<TResult = any>(
    handler: (session: {
      readonly device: DeviceRepository;
      readonly login: LoginRepository;
      readonly user: UserRepository;
    }) => Promise<TResult>
  ): Promise<TResult> {
    try {
      await this.database.exec('BEGIN');
      const result = await handler({
        device: this.deviceRepository,
        login: this.loginRepository,
        user: this.userRepository,
      });
      await this.database.exec('COMMIT');
      return result;
    } catch (error) {
      await this.database.exec('ROLLBACK');
      throw error;
    }
  }
}
