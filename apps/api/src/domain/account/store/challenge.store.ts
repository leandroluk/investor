import {type UserEntity} from '../entity';

export abstract class ChallengeStore {
  abstract create(id: UserEntity['id']): Promise<{challengeId: string; otp: string}>;
  abstract verify(challengeId: string, otp: string): Promise<UserEntity['id']>;
}
