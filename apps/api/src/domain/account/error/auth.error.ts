import {DomainError} from '#/domain/_shared/error';

export class AuthUnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'auth.unauthorized');
  }
}

export class AuthSessionExpiredError extends DomainError {
  constructor(message = 'Session expired') {
    super(message, 'auth.session_expired');
  }
}
