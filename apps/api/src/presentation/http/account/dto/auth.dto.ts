import {
  ActivateUserCommand,
  Authorize2FACommand,
  LoginUsingCredentialCommand,
  LoginUsingTokenCommand,
  RefreshTokenCommand,
  RegisterUserCommand,
  ResetPasswordCommand,
  Send2FAEmailCommand,
  SendActivateEmailCommand,
  SendRecoverCommand,
} from '#/application/account/command';
import {CheckEmailQuery} from '#/application/account/query';
import {PickType} from '@nestjs/swagger';

// #region ActivateUser
export class ActivateUserBodyDTO extends ActivateUserCommand {}
// #endregion

// #region Authorize2FA
export class Authorize2FABodyDTO extends PickType(Authorize2FACommand, ['challengeId', 'otp']) {}
// #endregion

// #region CheckEmail
export class CheckEmailParamsDTO extends CheckEmailQuery {}
// #endregion

// #region LoginUsingCredential
export class LoginUsingCredentialBodyDTO extends PickType(LoginUsingCredentialCommand, ['email', 'password']) {}
// #endregion

// #region LoginUsingToken
export class LoginUsingTokenBodyDTO extends PickType(LoginUsingTokenCommand, ['token']) {}
// #endregion

// #region RefreshToken
export class RefreshTokenBodyDTO extends RefreshTokenCommand {}
// #endregion

// #region RegisterUser
export class RegisterUserBodyDTO extends RegisterUserCommand {}
// #endregion

// #region ResetPassword
export class ResetPasswordBodyDTO extends ResetPasswordCommand {}
// #endregion

// #region Send2FAEmail
export class Send2FABodyDTO extends Send2FAEmailCommand {}
// #endregion

// #region SendActivationEmail
export class SendActivationEmailBodyDTO extends SendActivateEmailCommand {}
// #endregion

// #region SendRecover
export class SendRecoverBodyDTO extends SendRecoverCommand {}
// #endregion
