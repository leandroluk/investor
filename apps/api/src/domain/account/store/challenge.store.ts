import {type ChallengeEntity} from '../entity';

export abstract class ChallengeStore {
  abstract save(challenge: ChallengeEntity): Promise<void>;
  abstract get(userId: string): Promise<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'> | null>;
  abstract delete(userId: string): Promise<void>;
}
