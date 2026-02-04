import {DomainError} from '#/domain/_shared/error';

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
