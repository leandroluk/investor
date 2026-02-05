import {type ChallengeEntity} from '../entity';

export abstract class ChallengeRepository {
  abstract create(entity: ChallengeEntity): Promise<void>;
  abstract update(entity: ChallengeEntity): Promise<void>;
  abstract findById(id: string): Promise<ChallengeEntity | null>;
  abstract findPendingByUserId(userId: string): Promise<ChallengeEntity[]>;
}
