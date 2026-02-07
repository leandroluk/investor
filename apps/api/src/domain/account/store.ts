import {type ChallengeEntity, type DeviceEntity, type UserEntity} from './entity';

export abstract class ChallengeStore {
  abstract save(challenge: ChallengeEntity): Promise<void>;
  abstract get(userId: string): Promise<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'> | null>;
  abstract delete(userId: string): Promise<void>;
}

export abstract class DeviceStore {
  abstract save(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void>;
  abstract has(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<boolean>;
  abstract delete(userId: DeviceEntity['userId'], fingerprint: DeviceEntity['fingerprint']): Promise<void>;
}

export abstract class OtpStore {
  abstract create(userId: UserEntity['id']): Promise<string>;
  abstract verify(otp: string): Promise<UserEntity['id']>;
}

export abstract class SessionStore {
  abstract create(userId: UserEntity['id'], deviceFingerprint: DeviceEntity['fingerprint']): Promise<string>;
  abstract refresh(
    sessionKey: string,
    userId: UserEntity['id'],
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void>;
  abstract revoke(
    sessionKey: string,
    userId: UserEntity['id'],
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void>;
}
