import {ReviewDocumentCommand} from '#/application/admin/command';
import {ListDocumentToApproveQuery} from '#/application/admin/query';
import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta} from '../_shared/decorators';
import {
  ListDocumentToApproveQueryDTO,
  ListDocumentToApproveResultDTO,
  ReviewDocumentBodyDTO,
  ReviewDocumentParamDTO,
} from './dto';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region getListDocumentToApprove
  @Get('document')
  @ApiOkResponse({description: 'List of documents to approve', type: ListDocumentToApproveResultDTO})
  async getListDocumentToApprove(
    @GetMeta() meta: GetMeta,
    @Query() query: ListDocumentToApproveQueryDTO
  ): Promise<ListDocumentToApproveResultDTO> {
    return await this.queryBus.execute(new ListDocumentToApproveQuery({...meta, ...query}));
  }
  // #endregion

  // #region reviewDocument
  @Patch('document/:documentId/review')
  @ApiOkResponse({description: 'Document reviewed successfully'})
  async reviewDocument(
    @GetMeta() {userId: adminId, ...meta}: GetMeta,
    @Param() param: ReviewDocumentParamDTO,
    @Body() body: ReviewDocumentBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ReviewDocumentCommand({...meta, ...param, ...body, adminId}));
  }
  // #endregion
}
