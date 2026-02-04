import {type DeviceEntity, type UserEntity} from '../entity';

export abstract class SessionStore {
  abstract create(user: UserEntity, device: DeviceEntity): Promise<string>;
  abstract refresh(
    userId: UserEntity['id'],
    sessionKey: string,
    deviceFingerprint: DeviceEntity['fingerprint']
  ): Promise<void>;
  abstract revoke(userId: UserEntity['id'], sessionKey: string): Promise<void>;
}
