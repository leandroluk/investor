import {type UserEntity} from '../entity';

export abstract class OtpStore {
  abstract create(email: UserEntity['email']): Promise<string>;
  abstract verify(otp: string): Promise<UserEntity['email']>;
}
