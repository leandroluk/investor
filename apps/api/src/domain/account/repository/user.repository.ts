import {type UserEntity} from '../entity';

export abstract class UserRepository {
  abstract create(user: UserEntity): Promise<void>;
  abstract update(user: UserEntity): Promise<void>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
}
