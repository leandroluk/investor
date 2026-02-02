import {RegisterUserCommand} from '#/application/account/command';
import {CheckEmailQuery} from '#/application/account/query';
import {EmailInUseError} from '#/domain/account/error';
import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiParam, ApiTags} from '@nestjs/swagger';
import {DomainException, GetEnvelope} from '../_shared/decorator';
import {RegisterUserDTO} from './dto/register-user.dto';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('check/email/:email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({name: 'email', description: 'Email to check', example: 'user@email.com'})
  @DomainException([EmailInUseError, HttpStatus.CONFLICT])
  async getCheckEmail(
    @GetEnvelope() envelope: GetEnvelope, //
    @Param('email') email: string
  ): Promise<void> {
    return this.queryBus.execute(new CheckEmailQuery({...envelope, email}));
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @DomainException([EmailInUseError, HttpStatus.CONFLICT])
  async postRegisterUser(
    @GetEnvelope() envelope: GetEnvelope, //
    @Body() body: RegisterUserDTO
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand({...envelope, ...body}));
  }
}
