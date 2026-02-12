import {
  type ChallengeEntity,
  type DeviceEntity,
  type DocumentEntity,
  type KycEntity,
  type LoginEntity,
  type ProfileEntity,
  type UserEntity,
  type WalletEntity,
} from './entities';
import {type DocumentTypeEnum} from './enums';

export abstract class KycRepository {
  abstract create(kyc: KycEntity): Promise<void>;
  abstract update(kyc: KycEntity): Promise<void>;
  abstract findByUserId(userId: string): Promise<KycEntity | null>;
}

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
    status: string,
    limit: number,
    offset: number
  ): Promise<{items: DocumentEntity[]; total: number}>;
}

export abstract class LoginRepository {
  abstract create(login: LoginEntity): Promise<void>;
}

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: UserEntity['id']): Promise<UserEntity | null>;
  abstract getEmailById(id: UserEntity['id']): Promise<UserEntity['email'] | null>;
}

export abstract class ProfileRepository {
  abstract create(profile: ProfileEntity): Promise<void>;
  abstract update(profile: ProfileEntity): Promise<void>;
  abstract findByUserId(userId: string): Promise<ProfileEntity | null>;
}

export abstract class WalletRepository {
  abstract create(wallet: WalletEntity): Promise<void>;
  abstract update(wallet: WalletEntity): Promise<void>;
  abstract findById(id: string): Promise<WalletEntity | null>;
  abstract findByAddress(address: string): Promise<WalletEntity | null>;
  abstract listByUserId(userId: string): Promise<WalletEntity[]>;
}
