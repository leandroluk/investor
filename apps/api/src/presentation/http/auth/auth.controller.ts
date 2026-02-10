import {
  ActivateUserCommand,
  Authorize2FACommand,
  LoginUsingCredentialCommand,
  LoginUsingTokenCommand,
  RefreshTokenCommand,
  RegisterUserCommand,
  ResetPasswordCommand,
  Send2FACommand,
  SendActivateCommand,
  SendRecoverCommand,
} from '#/application/auth/command';
import {CheckEmailQuery} from '#/application/auth/query';
import {
  AuthSessionExpiredError,
  AuthUnauthorizedError,
  UserEmailInUseError,
  UserInvalidCredentialsError,
  UserInvalidOtpError,
  UserNotFoundError,
  UserNotPendingError,
  UserStatusError,
} from '#/domain/account/errors';
import {Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Post, Put} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiCreatedResponse, ApiHeader, ApiNoContentResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {
  ActivateUserBodyDTO,
  Authorize2FABodyDTO,
  CheckEmailParamsDTO,
  LoginUsingCredentialBodyDTO,
  LoginUsingTokenBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResultDTO,
  RegisterUserBodyDTO,
  ResetPasswordBodyDTO,
  Send2FABodyDTO,
  SendActivationBodyDTO,
  SendRecoverBodyDTO,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  // #region getCheckEmail
  @Get('check/email/:email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @MapDomainError([UserEmailInUseError, HttpStatus.CONFLICT])
  @ApiNoContentResponse({
    description: 'Email is available.',
  })
  async getCheckEmail(
    @GetMeta() meta: GetMeta, //
    @Param() params: CheckEmailParamsDTO
  ): Promise<void> {
    const result = await this.queryBus.execute(CheckEmailQuery.new({...meta, ...params}));
    return result;
  }
  // #endregion

  // #region postRegisterUser
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @MapDomainError([UserEmailInUseError, HttpStatus.CONFLICT])
  @ApiCreatedResponse({
    description: 'User registered successfully.',
  })
  async postRegisterUser(
    @GetMeta() meta: GetMeta, //
    @Body() body: RegisterUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(RegisterUserCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region postSendActivationEmail
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserStatusError, HttpStatus.CONFLICT]
  )
  @ApiOkResponse({description: 'Activation email sent.'})
  async postSendActivationEmail(
    @GetMeta() meta: GetMeta, //
    @Body() body: SendActivationBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(SendActivateCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region putActivateUser
  @Put('activate')
  @HttpCode(HttpStatus.OK)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [UserNotPendingError, HttpStatus.CONFLICT],
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  @ApiOkResponse({
    description: 'User activated successfully.',
  })
  async putActivateUser(
    @GetMeta() meta: GetMeta, //
    @Body() body: ActivateUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(ActivateUserCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region postSendRecover
  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({
    description: 'Password reset email sent.',
  })
  async postSendRecover(
    @GetMeta() meta: GetMeta, //
    @Body() body: SendRecoverBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(SendRecoverCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region putResetPassword
  @Put('recover')
  @HttpCode(HttpStatus.OK)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  @ApiOkResponse({
    description: 'Password reset successfully.',
  })
  async putResetPassword(
    @GetMeta() meta: GetMeta, //
    @Body() body: ResetPasswordBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(ResetPasswordCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region postSend2FA
  @Post('2fa')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({
    description: '2FA email sent.',
  })
  async postSend2FA(
    @GetMeta() meta: GetMeta, //
    @Body() body: Send2FABodyDTO
  ): Promise<void> {
    await this.commandBus.execute(Send2FACommand.new({...meta, ...body}));
  }
  // #endregion

  // #region putAuthorize2FA
  @Put('2fa')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidOtpError, HttpStatus.FORBIDDEN], [UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({description: 'User authenticated successfully.'})
  async putAuthorize2FA(
    @GetMeta() meta: GetMeta, //
    @Body() body: Authorize2FABodyDTO
  ): Promise<void> {
    await this.commandBus.execute(Authorize2FACommand.new({...meta, ...body}));
  }
  // #endregion

  // #region postLoginUsingCredential
  @Post('login/credential')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiHeader({name: 'x-fingerprint', required: false})
  @ApiOkResponse({description: 'Returns the final authorization token.'})
  async postLoginUsingCredential(
    @GetMeta() meta: GetMeta,
    @Body() body: LoginUsingCredentialBodyDTO,
    @Ip() ip: string
  ): Promise<void> {
    const result = await this.commandBus.execute(LoginUsingCredentialCommand.new({...meta, ...body, ip}));
    return result;
  }
  // #endregion

  // #region postLoginUsingToken
  @Post('login/token')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiHeader({name: 'x-fingerprint', required: false})
  @ApiOkResponse({description: 'Returns the final authorization token.'})
  async postLoginUsingToken(
    @GetMeta() meta: GetMeta, //
    @Body() body: LoginUsingTokenBodyDTO,
    @Ip() ip: string
  ): Promise<void> {
    const result = await this.commandBus.execute(LoginUsingTokenCommand.new({...meta, ...body, ip}));
    return result;
  }
  // #endregion

  // #region postRefreshToken
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.UNAUTHORIZED],
    [AuthUnauthorizedError, HttpStatus.UNAUTHORIZED],
    [AuthSessionExpiredError, HttpStatus.UNAUTHORIZED]
  )
  @ApiOkResponse({
    description: 'Returns the new authorization tokens.',
    type: RefreshTokenResultDTO,
  })
  async postRefreshToken(
    @GetMeta() meta: GetMeta, //
    @Body() body: RefreshTokenBodyDTO
  ): Promise<RefreshTokenResultDTO> {
    const result = await this.commandBus.execute(RefreshTokenCommand.new({...meta, ...body}));
    return result;
  }
  // #endregion
}
