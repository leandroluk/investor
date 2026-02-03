import {DomainError} from '#/domain/_shared/error';

export class AuthUnauthorizedError extends DomainError {
  constructor() {
    super('Unauthorized', 'auth.unauthorized');
  }
}
