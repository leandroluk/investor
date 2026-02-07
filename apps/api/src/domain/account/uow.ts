import {DomainUOW} from '#/domain/_shared/uow';
import {type ChallengeRepository, type DeviceRepository, type LoginRepository, type UserRepository} from './repository';

export abstract class AccountUOW extends DomainUOW<{
  get challenge(): ChallengeRepository;
  get device(): DeviceRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
}> {}
