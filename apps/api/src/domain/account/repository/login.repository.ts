import {type LoginEntity} from '../entity';

export abstract class LoginRepository {
  abstract create(login: LoginEntity): Promise<void>;
}
