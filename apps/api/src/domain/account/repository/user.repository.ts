import {type UserEntity} from '../entity';

export abstract class UserRepository {
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;
}
