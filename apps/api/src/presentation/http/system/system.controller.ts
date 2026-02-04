import {HealthQuery} from '#/application/system/query';
import {UnhealthyError} from '#/domain/system/error/unhealty.error';
import {Controller, Get, HttpStatus} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {DomainException, GetEnvelope} from '../_shared/decorator';
import {HealthResultDTO} from './dto';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly queryBus: QueryBus) {}

  // #region getHealth
  @Get('health')
  @ApiOkResponse({type: HealthResultDTO})
  @DomainException([UnhealthyError, HttpStatus.SERVICE_UNAVAILABLE])
  async getHealth(
    @GetEnvelope() envelope: GetEnvelope //
  ): Promise<HealthResultDTO> {
    const result = await this.queryBus.execute(new HealthQuery(envelope));
    return result;
  }
  // #endregion
}
