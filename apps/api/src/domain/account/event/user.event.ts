import {DomainEvent} from '#/domain/_shared/event';
import {type UserEntity} from '../entity';

export class UserRegisteredEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
}> {}

export class UserActivatedEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

export class UserPasswordChangedEvent extends DomainEvent<{
  userId: UserEntity['id'];
}> {}

export class UserLoggedInEvent extends DomainEvent<{
  userId: UserEntity['id'];
  provider: string;
}> {}

export class UserRequestChallengeEvent extends DomainEvent<{
  userId: UserEntity['id'];
  userEmail: UserEntity['email'];
}> {}
