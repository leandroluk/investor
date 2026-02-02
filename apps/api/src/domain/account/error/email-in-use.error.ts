import {DomainError} from '#/domain/_shared/error';

export class EmailInUseError extends DomainError {
  constructor(email: string) {
    super(`The provided email "${email}" is already in use.`, 'email.in_use');
  }
}
