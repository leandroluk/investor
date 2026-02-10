import {type ChallengeEntity, type DeviceEntity, type UserEntity} from './entities';

export abstract class ChallengeStore {
  abstract save(challenge: ChallengeEntity): Promise<void>;
  abstract get(userId: string): Promise<Pick<ChallengeEntity, 'id' | 'code' | 'expiresAt'> | null>;
  abstract delete(userId: string): Promise<void>;
}

export abstract class DeviceStore {
  abstract save(args: {
    userId: DeviceEntity['userId']; //
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void>;
  abstract has(args: {
    userId: DeviceEntity['userId'];
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<boolean>;
  abstract delete(args: {
    userId: DeviceEntity['userId'];
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void>;
}

export abstract class OtpStore {
  abstract create(userId: UserEntity['id']): Promise<string>;
  abstract verify(otp: string): Promise<UserEntity['id']>;
}

export abstract class SessionStore {
  abstract create(args: {
    userId: UserEntity['id']; //
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<string>;
  abstract refresh(args: {
    sessionKey: string;
    userId: UserEntity['id'];
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void>;
  abstract revoke(args: {
    sessionKey: string;
    userId: UserEntity['id'];
    deviceFingerprint: DeviceEntity['fingerprint'];
  }): Promise<void>;
}

export abstract class NonceStore {
  abstract save(args: {
    userId: UserEntity['id']; //
    nonce: string;
  }): Promise<void>;
  abstract get(userId: UserEntity['id']): Promise<string | null>;
  abstract delete(userId: UserEntity['id']): Promise<void>;
}
