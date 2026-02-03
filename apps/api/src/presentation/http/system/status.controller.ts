import {HealthQuery, HealthQueryResult} from '#/application/system/query';
import {UnhealthyError} from '#/domain/system/error/unhealty.error';
import {Controller, Get, HttpStatus} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {DomainException, GetEnvelope} from '../_shared/decorator';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly queryBus: QueryBus) {}

  // #region getHealth
  @Get('health')
  @ApiOkResponse({type: HealthQueryResult})
  @DomainException([UnhealthyError, HttpStatus.SERVICE_UNAVAILABLE])
  async getHealth(
    @GetEnvelope() envelope: GetEnvelope //
  ): Promise<HealthQueryResult> {
    return this.queryBus.execute(new HealthQuery(envelope));
  }
  // #endregion
}
