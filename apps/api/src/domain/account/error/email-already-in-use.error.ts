import {DomainError} from '#/domain/_shared/error';

export class EmailAlreadyInUseError extends DomainError {
  constructor(email: string) {
    super(`Email already in use: ${email}`, 'ACCOUNT.EMAIL_ALREADY_IN_USE');
  }
}
