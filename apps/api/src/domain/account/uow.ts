import {UOW} from '#/domain/_shared/classes';
import {
  type ChallengeRepository,
  type DeviceRepository,
  type LoginRepository,
  type UserRepository,
} from './repositories';

export abstract class AccountUOW extends UOW<{
  get challenge(): ChallengeRepository;
  get device(): DeviceRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
}> {}
