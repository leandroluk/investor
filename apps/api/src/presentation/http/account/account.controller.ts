import {Envelope} from '#/application/_shared/bus';
import {CheckEmailQuery} from '#/application/account/query/check-email.query';
import {EmailAlreadyInUseError} from '#/domain/account/error/email-already-in-use.error';
import {Controller, Get, Param} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiTags} from '@nestjs/swagger';
import {ApiDomainResponse, GetEnvelope} from '../_shared/decorator';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('check/email/:email')
  @ApiDomainResponse(EmailAlreadyInUseError)
  async getCheckEmail(
    @GetEnvelope() envelope: Envelope, //
    @Param('email') email: string
  ): Promise<void> {
    return this.queryBus.execute(new CheckEmailQuery({...envelope, email}));
  }
}
