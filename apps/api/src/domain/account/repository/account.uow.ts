import {DomainUOW} from '#/domain/_shared/uow';
import {type DeviceRepository, type LoginRepository, type UserRepository} from '.';

export abstract class AccountUOW extends DomainUOW<{
  get device(): DeviceRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
}> {}
