import {type UserEntity} from '../entity';

export abstract class SessionStore {
  abstract create(userId: UserEntity['id'], ip: string, userAgent: string): Promise<string>;
  abstract refresh(userId: UserEntity['id'], sessionKey: string, ip: string, userAgent: string): Promise<void>;
  abstract revoke(userId: UserEntity['id'], sessionKey: string): Promise<void>;
}
