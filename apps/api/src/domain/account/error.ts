import {DomainError} from '#/domain/_shared/error';

// #region Auth
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
// #endregion

// #region Device
export class DeviceNotFoundError extends DomainError {
  constructor(message = 'Device not found') {
    super(message, 'device.not_found');
  }
}

export class DeviceNotOwnedError extends DomainError {
  constructor(message = 'Device does not belong to user') {
    super(message, 'device.not_owned');
  }
}
// #endregion

// #region Sso
export class SsoInvalidProviderError extends DomainError {
  constructor(provider: string, message = `Invalid provider: ${provider}. Must be one of: google, microsoft.`) {
    super(message, 'sso.invalid_provider');
  }
}

export class SsoInvalidOAuthCodeError extends DomainError {
  constructor(message = 'Invalid or expired authorization code') {
    super(message, 'sso.invalid_oauth_code');
  }
}

export class SsoInvalidStateError extends DomainError {
  constructor(message = 'Unable to decrypt state parameter') {
    super(message, 'sso.invalid_state');
  }
}
// #endregion

// #region User
export class UserEmailInUseError extends DomainError {
  constructor(email: string, message = `The provided email "${email}" is already in use.`) {
    super(message, 'user.email_in_use');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(message = 'User not found') {
    super(message, 'user.not_found');
  }
}

export class UserStatusError extends DomainError {
  constructor(message = 'User status error') {
    super(message, 'user.status_error');
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
// #endregion
