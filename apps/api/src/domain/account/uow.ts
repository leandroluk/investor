import {UOW} from '#/domain/_shared/classes';
import {
  type ChallengeRepository,
  type DeviceRepository,
  type DocumentRepository,
  type KycRepository,
  type LoginRepository,
  type ProfileRepository,
  type UserRepository,
  type WalletRepository,
} from './repositories';

export abstract class AccountUOW extends UOW<{
  get challenge(): ChallengeRepository;
  get device(): DeviceRepository;
  get document(): DocumentRepository;
  get kyc(): KycRepository;
  get login(): LoginRepository;
  get user(): UserRepository;
  get profile(): ProfileRepository;
  get wallet(): WalletRepository;
}> {}
