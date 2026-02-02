import {DomainEvent} from '#/domain/_shared/event';
import {type UserEntity} from '../entity';

export class UserRegisteredEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
}> {}
