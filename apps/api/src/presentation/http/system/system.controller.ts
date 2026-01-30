import {Controller, Get} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';

import {Envelope} from '#/application/_shared/bus';
import {HealthQuery, HealthQueryResult} from '#/application/support/query/health.query';
import {UnhealthyError} from '#/domain/system/error/unhealty.error';
import {QueryBus} from '@nestjs/cqrs';
import {ApiDomainResponse, GetEnvelope} from '../_shared/decorator';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('health')
  @ApiOkResponse({type: HealthQueryResult})
  @ApiDomainResponse(UnhealthyError)
  async getHealth(
    @GetEnvelope() metadata: Envelope //
  ): Promise<HealthQueryResult> {
    return this.queryBus.execute(new HealthQuery(metadata));
  }
}
