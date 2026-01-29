import {Controller, Get} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';

import {HealthQuery, HealthQueryResult} from '#/context/support/application/query/health.query';
import {MessageMetadata} from '#/core/application/bus/message-metadata';
import {BaseController} from '#/core/presentation/http/controllers/base.controller';
import {ApiDomainResponse} from '#/core/presentation/http/decorator/api-domain-response.decorator';
import {GetMessageMetadata} from '#/core/presentation/http/decorator/get-message-metadata.decorator';

@ApiTags('support')
@Controller('support')
export class SupportController extends BaseController {
  @Get('health')
  @ApiOkResponse({type: HealthQueryResult})
  @ApiDomainResponse()
  async getHealth(@GetMessageMetadata() metadata: MessageMetadata): Promise<HealthQueryResult> {
    return this.queryBus.execute(new HealthQuery(metadata));
  }
}
