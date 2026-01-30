import {Envelope} from '#/application/_shared/bus';
import {CheckEmailQuery} from '#/application/account/query/check-email.query';
import {EmailConflitError} from '#/domain/account/error/email-conflit.error';
import {Controller, Get, Param} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiParam, ApiTags} from '@nestjs/swagger';
import {ApiDomainResponse, GetEnvelope} from '../_shared/decorator';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('check/email/:email')
  @ApiDomainResponse(EmailConflitError)
  @ApiParam({name: 'email', description: 'Email to check', example: 'user@email.com'})
  async getCheckEmail(
    @GetEnvelope() envelope: Envelope, //
    @Param('email') email: string
  ): Promise<void> {
    return this.queryBus.execute(new CheckEmailQuery({...envelope, email}));
  }
}
