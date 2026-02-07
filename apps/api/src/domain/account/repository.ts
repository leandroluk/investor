import {
  type ChallengeEntity,
  type DeviceEntity,
  type DocumentEntity,
  type LoginEntity,
  type UserEntity,
} from './entity';
import {type DocumentStatusEnum, type DocumentTypeEnum} from './enum';
import {type DocumentView} from './view';

export abstract class ChallengeRepository {
  abstract create(entity: ChallengeEntity): Promise<void>;
  abstract update(entity: ChallengeEntity): Promise<void>;
  abstract findById(id: string): Promise<ChallengeEntity | null>;
  abstract findPendingByUserId(userId: string): Promise<ChallengeEntity[]>;
}

export abstract class DeviceRepository {
  abstract create(device: DeviceEntity): Promise<void>;
  abstract update(device: DeviceEntity): Promise<void>;
  abstract findByFingerprint(userId: string, fingerprint: string): Promise<DeviceEntity | null>;
  abstract findById(id: string): Promise<DeviceEntity | null>;
  abstract listActiveByUserId(userId: string): Promise<DeviceEntity[]>;
  abstract listFingerprintByUserId(userId: string): Promise<Array<DeviceEntity['fingerprint']>>;
}

export abstract class DocumentRepository {
  abstract create(document: DocumentEntity): Promise<void>;
  abstract update(document: DocumentEntity): Promise<void>;
  abstract findById(id: string): Promise<DocumentEntity | null>;
  abstract findByUserIdAndType(userId: string, type: DocumentTypeEnum): Promise<DocumentEntity | null>;
  abstract findByUserId(userId: string): Promise<DocumentEntity[]>;
  abstract findByStatus(
    status: DocumentStatusEnum,
    limit: number,
    offset: number
  ): Promise<{items: DocumentView[]; total: number}>;
}

export abstract class LoginRepository {
  abstract create(login: LoginEntity): Promise<void>;
}

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
}
