import {
  ActivateUserCommand,
  Authorize2FACommand,
  Authorize2FACommandResult,
  LoginUsingCredentialCommand,
  LoginUsingCredentialCommandAuthorizationResult,
  LoginUsingCredentialCommandChallengeResult,
  LoginUsingTokenCommand,
  LoginUsingTokenCommandAuthorizationResult,
  LoginUsingTokenCommandChallengeResult,
  RegisterUserCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  Send2FACommand,
  Send2FACommandResult,
  SendActivationEmailCommand,
} from '#/application/account/command';
import {CheckEmailQuery} from '#/application/account/query';
import {
  UserAlreadyActiveError,
  UserEmailInUseError,
  UserInvalidCredentialsError,
  UserInvalidOtpError,
  UserNotFoundError,
  UserNotPendingError,
} from '#/domain/account/error';
import {Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Patch, Post, Res} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiAcceptedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {FastifyReply} from 'fastify';
import {DomainException, GetEnvelope} from '../_shared/decorator';
import {
  ActivateUserBodyDTO,
  Authorize2FABodyDTO,
  CheckEmailDTOParams as CheckEmailParamsDTO,
  LoginUsingCredentialBodyDTO,
  LoginUsingTokenBodyDTO,
  RegisterUserBodyDTO,
  RequestPasswordResetBodyDTO,
  ResetPasswordBodyDTO,
  Send2FABodyDTO,
  SendActivationEmailBodyDTO,
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
    [UserAlreadyActiveError, HttpStatus.CONFLICT]
  )
  async postSendActivationEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: SendActivationEmailBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendActivationEmailCommand({...envelope, ...body}));
  }
  // #endregion

  // #region patchActivateUser
  @Patch('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND],
    [UserNotPendingError, HttpStatus.CONFLICT],
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  async patchActivateUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: ActivateUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ActivateUserCommand({...envelope, ...body}));
  }
  // #endregion

  // #region postSendPasswordReset
  @Post('recover')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException([UserNotFoundError, HttpStatus.NOT_FOUND])
  async postSendPasswordReset(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RequestPasswordResetBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RequestPasswordResetCommand({...envelope, ...body}));
  }
  // #endregion

  // #region patchPasswordReset
  @Patch('recover')
  @HttpCode(HttpStatus.OK)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  async patchPasswordReset(
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
  async postSend2FA(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: Send2FABodyDTO
  ): Promise<Send2FACommandResult> {
    return await this.commandBus.execute(new Send2FACommand({...envelope, ...body}));
  }
  // #endregion

  // #region patch2FA
  @Patch('2fa')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidOtpError, HttpStatus.FORBIDDEN])
  async patch2FA(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: Authorize2FABodyDTO,
    @Ip() ip: string
  ): Promise<Authorize2FACommandResult> {
    return this.commandBus.execute(new Authorize2FACommand({...envelope, ...body, ip}));
  }
  // #endregion

  // #region postLoginUsingCredential
  @Post('login/credential')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiAcceptedResponse({
    description: 'Returns an MFA challenge.',
    type: LoginUsingCredentialCommandChallengeResult,
  })
  @ApiOkResponse({
    description: 'Returns the final authorization token.',
    type: LoginUsingCredentialCommandAuthorizationResult,
  })
  async postLoginUsingCredential(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: LoginUsingCredentialBodyDTO,
    @Ip() ip: string,
    @Res({passthrough: true}) reply: FastifyReply
  ): Promise<void> {
    const {type, result} = await this.commandBus.execute(new LoginUsingCredentialCommand({...envelope, ...body, ip}));
    if (type === 'challenge') {
      reply.status(HttpStatus.ACCEPTED).send(result);
    } else {
      reply.status(HttpStatus.OK).send(result);
    }
  }
  // #endregion

  // #region postLoginUsingToken
  @Post('login/token')
  @HttpCode(HttpStatus.OK)
  @DomainException([UserInvalidCredentialsError, HttpStatus.UNAUTHORIZED])
  @ApiAcceptedResponse({
    description: 'Returns an MFA challenge.',
    type: LoginUsingTokenCommandChallengeResult,
  })
  @ApiOkResponse({
    description: 'Returns the final authorization token.',
    type: LoginUsingTokenCommandAuthorizationResult,
  })
  async postLoginUsingToken(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: LoginUsingTokenBodyDTO,
    @Ip() ip: string,
    @Res({passthrough: true}) reply: FastifyReply
  ): Promise<void> {
    const {type, result} = await this.commandBus.execute(new LoginUsingTokenCommand({...envelope, ...body, ip}));
    if (type === 'challenge') {
      reply.status(HttpStatus.ACCEPTED).send(result);
    } else {
      reply.status(HttpStatus.OK).send(result);
    }
  }
  // #endregion
}
