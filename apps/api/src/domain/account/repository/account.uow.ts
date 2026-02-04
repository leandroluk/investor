import {DomainUOW} from '#/domain/_shared/uow';
import {type ChallengeRepository} from './challenge.repository';
import {type DeviceRepository} from './device.repository';
import {type LoginRepository} from './login.repository';
import {type UserRepository} from './user.repository';

export abstract class AccountUOW extends DomainUOW<{
  get challenge(): ChallengeRepository;
  get device(): DeviceRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
}> {}
