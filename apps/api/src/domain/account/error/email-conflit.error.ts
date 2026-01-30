import {DomainError} from '#/domain/_shared/error';

export class EmailConflitError extends DomainError {
  constructor(email: string) {
    super(`The provided email "${email}" is already associated with an account.`, 'auth.email_conflit');
  }
}
