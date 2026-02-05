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
import {TokenPort} from '#/domain/_shared/port';
import {
  AuthSessionExpiredError,
  AuthUnauthorizedError,
  UserEmailInUseError,
  UserInvalidCredentialsError,
  UserInvalidOtpError,
  UserNotFoundError,
  UserNotPendingError,
  UserStatusError,
} from '#/domain/account/error';
import {Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Post, Put, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiAcceptedResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorator';
import {ChallengeGuard} from '../_shared/guard';
import {
  ActivateUserBodyDTO,
  Authorize2FABodyDTO,
  CheckEmailParamsDTO,
  LoginUsingCredentialBodyDTO,
  LoginUsingTokenBodyDTO,
  RefreshTokenBodyDTO,
  RegisterUserBodyDTO,
  ResetPasswordBodyDTO,
  Send2FABodyDTO,
  SendActivationEmailBodyDTO,
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
    @GetMeta() envelope: GetMeta, //
    @Param() params: CheckEmailParamsDTO
  ): Promise<void> {
    const result = await this.queryBus.execute(new CheckEmailQuery({...envelope, ...params}));
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
    @GetMeta() envelope: GetMeta, //
    @Body() body: RegisterUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSendActivationEmail
  @Post('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserStatusError, HttpStatus.CONFLICT]
  )
  @ApiAcceptedResponse({
    description: 'Activation email sent.',
  })
  async postSendActivationEmail(
    @GetMeta() envelope: GetMeta, //
    @Body() body: SendActivationEmailBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendActivateEmailCommand({...envelope, ...body}));
  }
  // #endregion

  // #region putActivateUser
  @Put('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @MapDomainError(
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [UserNotPendingError, HttpStatus.CONFLICT],
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  @ApiAcceptedResponse({
    description: 'User activated successfully.',
  })
  async putActivateUser(
    @GetMeta() envelope: GetMeta, //
    @Body() body: ActivateUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ActivateUserCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSendRecover
  @Post('recover')
  @HttpCode(HttpStatus.ACCEPTED)
  @MapDomainError([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiAcceptedResponse({
    description: 'Password reset email sent.',
  })
  async postSendRecover(
    @GetMeta() envelope: GetMeta, //
    @Body() body: SendRecoverBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendRecoverCommand({...envelope, ...body}));
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
    @GetMeta() envelope: GetMeta, //
    @Body() body: ResetPasswordBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ResetPasswordCommand({...envelope, ...body}));
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
    @GetMeta() envelope: GetMeta, //
    @Body() body: Send2FABodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new Send2FAEmailCommand({...envelope, ...body}));
  }
  // #endregion

  // #region putAuthorize2FA
  @Put('2fa')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidOtpError, HttpStatus.FORBIDDEN], [UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({description: 'User authenticated successfully.'})
  async putAuthorize2FA(
    @GetMeta() envelope: GetMeta, //
    @Body() body: Authorize2FABodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new Authorize2FACommand({...envelope, ...body}));
  }
  // #endregion

  // #region postLoginUsingCredential
  @Post('login/credential')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiOkResponse({description: 'Returns the final authorization token.'})
  async postLoginUsingCredential(
    @GetMeta() envelope: GetMeta,
    @Body() body: LoginUsingCredentialBodyDTO,
    @Ip() ip: string
  ): Promise<void> {
    const result = await this.commandBus.execute(new LoginUsingCredentialCommand({...envelope, ...body, ip}));
    return result;
  }
  // #endregion

  // #region postLoginUsingToken
  @Post('login/token')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiOkResponse({description: 'Returns the final authorization token.'})
  async postLoginUsingToken(
    @GetMeta() envelope: GetMeta, //
    @Body() body: LoginUsingTokenBodyDTO,
    @Ip() ip: string
  ): Promise<void> {
    const result = await this.commandBus.execute(new LoginUsingTokenCommand({...envelope, ...body, ip}));
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
  @ApiOkResponse({description: 'Returns the new authorization tokens.'})
  @UseGuards(ChallengeGuard)
  async postRefreshToken(
    @GetMeta() envelope: GetMeta, //
    @Body() body: RefreshTokenBodyDTO
  ): Promise<TokenPort.Authorization> {
    const result = await this.commandBus.execute(new RefreshTokenCommand({...envelope, ...body}));
    return result;
  }
  // #endregion
}
