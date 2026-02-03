import {
  ActivateUserCommand,
  RegisterUserCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  SendActivationEmailCommand,
} from '#/application/account/command';
import {CheckEmailQuery} from '#/application/account/query';
import {
  UserAlreadyActiveError,
  UserEmailInUseError,
  UserInvalidOtpError,
  UserNotFoundError,
  UserNotPendingError,
} from '#/domain/account/error';
import {Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiTags} from '@nestjs/swagger';
import {DomainException, GetEnvelope} from '../_shared/decorator';
import {
  ActivateUserBodyDTO,
  CheckEmailDTOParams as CheckEmailParamsDTO,
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
    return this.queryBus.execute(
      new CheckEmailQuery({
        ...envelope,
        ...params,
      })
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @DomainException([UserEmailInUseError, HttpStatus.CONFLICT])
  async postRegisterUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RegisterUserBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(
      new RegisterUserCommand({
        ...envelope,
        ...body,
      })
    );
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
    await this.commandBus.execute(
      new SendActivationEmailCommand({
        ...envelope,
        ...body,
      })
    );
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
    await this.commandBus.execute(
      new ActivateUserCommand({
        ...envelope,
        ...body,
      })
    );
  }

  @Post('recover')
  @HttpCode(HttpStatus.ACCEPTED)
  @DomainException([UserNotFoundError, HttpStatus.NOT_FOUND])
  async postRequestPasswordReset(
    @GetEnvelope() envelope: GetEnvelope,
    @Body() body: RequestPasswordResetBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(
      new RequestPasswordResetCommand({
        ...envelope,
        ...body,
      })
    );
  }

  @Patch('recover')
  @HttpCode(HttpStatus.OK)
  @DomainException(
    [UserNotFoundError, HttpStatus.NOT_FOUND], //
    [UserInvalidOtpError, HttpStatus.FORBIDDEN]
  )
  async patchResetPassword(@GetEnvelope() envelope: GetEnvelope, @Body() body: ResetPasswordBodyDTO): Promise<void> {
    await this.commandBus.execute(
      new ResetPasswordCommand({
        ...envelope,
        ...body,
      })
    );
  }
}
