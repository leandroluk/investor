import {ReviewDocumentCommand} from '#/application/admin/command';
import {ListDocumentsToApproveQuery, ListDocumentsToApproveResult} from '#/application/admin/query';
import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta} from '../_shared/decorators';
import {ListDocumentQueryDTO, ReviewDocumentBodyDTO, ReviewDocumentParamDTO} from './dto';

@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('kyc/document')
  @ApiOkResponse({description: 'List of documents to approve'})
  async listDocuments(
    @GetMeta() meta: GetMeta,
    @Query() query: ListDocumentQueryDTO
  ): Promise<ListDocumentsToApproveResult> {
    return await this.queryBus.execute(new ListDocumentsToApproveQuery({...meta, ...query}));
  }

  @Patch('kyc/document/:documentId/review')
  @ApiOkResponse({description: 'Document reviewed successfully'})
  async reviewDocument(
    @GetMeta() {userId: adminId, ...meta}: GetMeta,
    @Param() param: ReviewDocumentParamDTO,
    @Body() body: ReviewDocumentBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new ReviewDocumentCommand({...meta, ...param, ...body, adminId}));
  }
}
