import {DomainError} from '#/domain/_shared/error';

export class UserEmailInUseError extends DomainError {
  constructor(email: string) {
    super(`The provided email "${email}" is already in use.`, 'user.email_in_use');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(message = 'User not found') {
    super(message, 'user.not_found');
  }
}

export class UserAlreadyActiveError extends DomainError {
  constructor(message = 'User already active') {
    super(message, 'user.already_active');
  }
}

export class UserInvalidOtpError extends DomainError {
  constructor(message = 'Invalid or expired OTP') {
    super(message, 'user.invalid_otp');
  }
}

export class UserNotPendingError extends DomainError {
  constructor(message = 'User is not pending') {
    super(message, 'user.not_pending');
  }
}

export class UserInvalidCredentialsError extends DomainError {
  constructor(message = 'Invalid credentials') {
    super(message, 'user.invalid_credentials');
  }
}
