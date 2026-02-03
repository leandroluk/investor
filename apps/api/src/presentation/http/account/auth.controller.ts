import {
  ActivateUserCommand,
  LoginUsingCredentialCommand,
  LoginUsingCredentialCommandAuthorizationResult,
  LoginUsingCredentialCommandChallengeResult,
  LoginUsingTokenCommand,
  LoginUsingTokenCommandAuthorizationResult,
  LoginUsingTokenCommandChallengeResult,
  RegisterUserCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
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
  CheckEmailDTOParams as CheckEmailParamsDTO,
  LoginUsingCredentialBodyDTO,
  LoginUsingTokenBodyDTO,
  RegisterUserBodyDTO,
  RequestPasswordResetBodyDTO,
  ResetPasswordBodyDTO,
  SendActivationEmailBodyDTO,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('check/email/:email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DomainException([UserEmailInUseError, HttpStatus.CONFLICT])
  async getCheckEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Param() params: CheckEmailParamsDTO
  ): Promise<void> {
    return this.queryBus.execute(new CheckEmailQuery({...envelope, ...params}));
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @DomainException([UserEmailInUseError, HttpStatus.CONFLICT])
  async postRegisterUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RegisterUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand({...envelope, ...body}));
  }

  @Post('activate')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserAlreadyActiveError, HttpStatus.CONFLICT]
  )
  async postResendActivationEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: SendActivationEmailBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new SendActivationEmailCommand({...envelope, ...body}));
  }

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

  @Post('recover')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException([UserNotFoundError, HttpStatus.NOT_FOUND])
  async postRequestPasswordReset(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RequestPasswordResetBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RequestPasswordResetCommand({...envelope, ...body}));
  }

  @Patch('recover')
  @HttpCode(HttpStatus.OK)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  async patchResetPassword(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: ResetPasswordBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ResetPasswordCommand({...envelope, ...body}));
  }

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
}
