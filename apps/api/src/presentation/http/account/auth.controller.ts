import {
  ActivateUserCommand,
  Authorize2FACommand,
  Authorize2FACommandResult,
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
import {Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Post, Put, Req} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiAcceptedResponse, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {FastifyRequest} from 'fastify';
import {DomainException, GetEnvelope} from '../_shared/decorator';
import {
  ActivateUserBodyDTO,
  Authorize2FABodyDTO,
  Authorize2FAResultDTO,
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
  @DomainException([UserEmailInUseError, HttpStatus.CONFLICT])
  @ApiNoContentResponse({
    description: 'Email is available.',
  })
  async getCheckEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Param() params: CheckEmailParamsDTO
  ): Promise<void> {
    return this.queryBus.execute(new CheckEmailQuery({...envelope, ...params}));
  }
  // #endregion

  // #region postRegisterUser
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @DomainException([UserEmailInUseError, HttpStatus.CONFLICT])
  @ApiCreatedResponse({
    description: 'User registered successfully.',
  })
  async postRegisterUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RegisterUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSendActivationEmail
  @Post('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserStatusError, HttpStatus.CONFLICT]
  )
  @ApiAcceptedResponse({
    description: 'Activation email sent.',
  })
  async postSendActivationEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: SendActivationEmailBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendActivateEmailCommand({...envelope, ...body}));
  }
  // #endregion

  // #region putActivateUser
  @Put('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [UserNotPendingError, HttpStatus.CONFLICT],
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  @ApiAcceptedResponse({
    description: 'User activated successfully.',
  })
  async putActivateUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: ActivateUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ActivateUserCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSendRecover
  @Post('recover')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiAcceptedResponse({
    description: 'Password reset email sent.',
  })
  async postSendRecover(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: SendRecoverBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendRecoverCommand({...envelope, ...body}));
  }
  // #endregion

  // #region putResetPassword
  @Put('recover')
  @HttpCode(HttpStatus.OK)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  @ApiOkResponse({
    description: 'Password reset successfully.',
  })
  async putResetPassword(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: ResetPasswordBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ResetPasswordCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSend2FA
  @Post('2fa')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({
    description: '2FA email sent.',
  })
  async postSend2FA(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: Send2FABodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new Send2FAEmailCommand({...envelope, ...body}));
  }
  // #endregion

  // #region putAuthorize2FA
  @Put('2fa')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidOtpError, HttpStatus.FORBIDDEN], [UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({
    description: 'User authenticated successfully.',
    type: Authorize2FAResultDTO,
  })
  async putAuthorize2FA(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: Authorize2FABodyDTO,
    @Ip() ip: string,
    @Req() request: FastifyRequest
  ): Promise<Authorize2FACommandResult> {
    return this.commandBus.execute(
      new Authorize2FACommand({
        ...envelope,
        ...body,
        ip,
        userAgent: request.headers['user-agent']!,
      })
    );
  }
  // #endregion

  // #region postLoginUsingCredential
  @Post('login/credential')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiOkResponse({
    description: 'Returns the final authorization token.',
  })
  async postLoginUsingCredential(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: LoginUsingCredentialBodyDTO,
    @Ip() ip: string,
    @Req() request: FastifyRequest
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginUsingCredentialCommand({
        ...envelope,
        ...body,
        ip,
        userAgent: request.headers['user-agent']!,
      })
    );
    return result;
  }
  // #endregion

  // #region postLoginUsingToken
  @Post('login/token')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiOkResponse({
    description: 'Returns the final authorization token.',
  })
  async postLoginUsingToken(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: LoginUsingTokenBodyDTO,
    @Ip() ip: string,
    @Req() request: FastifyRequest
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginUsingTokenCommand({
        ...envelope,
        ...body,
        ip,
        userAgent: request.headers['user-agent']!,
      })
    );
    return result;
  }
  // #endregion

  // #region postRefreshToken
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @DomainException(
    [UserNotFoundError, HttpStatus.UNAUTHORIZED],
    [AuthUnauthorizedError, HttpStatus.UNAUTHORIZED],
    [AuthSessionExpiredError, HttpStatus.UNAUTHORIZED]
  )
  @ApiOkResponse({
    description: 'Returns the new authorization tokens.',
  })
  async postRefreshToken(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RefreshTokenBodyDTO,
    @Ip() ip: string,
    @Req() request: FastifyRequest
  ): Promise<TokenPort.Authorization> {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand({
        ...envelope,
        ...body,
        ip,
        userAgent: request.headers['user-agent']!,
      })
    );
    return result;
  }
  // #endregion
}
