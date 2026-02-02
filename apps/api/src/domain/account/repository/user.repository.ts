import {type UserEntity} from '../entity';

export abstract class UserRepository {
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract create(user: UserEntity): Promise<void>;
}
