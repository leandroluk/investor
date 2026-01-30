import {UnitOfWork} from '#/domain/_shared/unit-of-work';
import {type DeviceRepository, type LoginRepository, type UserRepository} from './repository';

export abstract class AccountUnitOfWork extends UnitOfWork<{
  get device(): DeviceRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
}> {}
