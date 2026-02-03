import {type UserEntity} from '../entity';

export abstract class ChallengeStore {
  abstract create(id: UserEntity['id']): Promise<{challengeId: string; code: string}>;
  abstract verify(challengeId: string, code: string): Promise<UserEntity['id']>;
}
