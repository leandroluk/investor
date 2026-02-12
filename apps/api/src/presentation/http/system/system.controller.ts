import {HealthQuery} from '#/application/system/query';
import {UnhealthyError} from '#/domain/system/errors';
import {Controller, Get, HttpStatus} from '@nestjs/common';
import {QueryBus} from '@nestjs/cqrs';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {HealthResultDTO} from './dto';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly queryBus: QueryBus) {}

  // #region getHealth
  @Get('health')
  @ApiOperation({summary: 'Check system health'})
  @ApiOkResponse({type: HealthResultDTO})
  @MapDomainError([UnhealthyError, HttpStatus.SERVICE_UNAVAILABLE])
  async getHealth(
    @GetMeta() meta: GetMeta //
  ): Promise<HealthResultDTO> {
    const result = await this.queryBus.execute(HealthQuery.new(meta));
    return result;
  }
  // #endregion
}
