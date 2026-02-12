import {ReviewDocumentCommand} from '#/application/admin/command';
import {ListDocumentToReviewQuery} from '#/application/admin/query';
import {DocumentNotFoundError, DocumentStatusError} from '#/domain/account/errors';
import {Body, Controller, Get, HttpStatus, Param, Patch, Query} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
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

  // #region getListDocumentToReview
  @Get('document')
  @ApiOperation({summary: 'List documents to review'})
  @ApiOkResponse({description: 'List of documents to review', type: ListDocumentToApproveResultDTO})
  async getListDocumentToReview(
    @GetMeta() meta: GetMeta,
    @Query() query: ListDocumentToApproveQueryDTO
  ): Promise<ListDocumentToApproveResultDTO> {
    return await this.queryBus.execute(ListDocumentToReviewQuery.new({...meta, ...query}));
  }
  // #endregion

  // #region reviewDocument
  @Patch('document/:documentId/review')
  @MapDomainError([DocumentNotFoundError, HttpStatus.NOT_FOUND], [DocumentStatusError, HttpStatus.UNPROCESSABLE_ENTITY])
  @ApiOperation({summary: 'Review a document'})
  @ApiOkResponse({description: 'Document reviewed successfully'})
  async reviewDocument(
    @GetMeta() {userId: adminId, ...meta}: GetMeta,
    @Param() param: ReviewDocumentParamDTO,
    @Body() body: ReviewDocumentBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(ReviewDocumentCommand.new({...meta, ...param, ...body, adminId}));
  }
  // #endregion
}
