import {type UserEntity} from '../entity';

export abstract class OtpStore {
  abstract create(userId: UserEntity['id']): Promise<string>;
  abstract verify(otp: string): Promise<UserEntity['id']>;
}
