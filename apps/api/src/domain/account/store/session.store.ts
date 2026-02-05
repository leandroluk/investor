import {type DeviceEntity, type UserEntity} from '../entity';

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
