import {ApiPropertyOf} from '#/application/_shared/decorator';
import {ReviewDocumentCommand} from '#/application/admin-document/command';
import {ListDocumentsToApproveQuery, ListDocumentsToApproveResult} from '#/application/admin-document/query';
import {DocumentEntity} from '#/domain/account/entity';
import {DocumentStatusEnum} from '#/domain/account/enum';
import {Body, Controller, Get, Param, Patch, Query} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOkResponse, ApiProperty, ApiTags} from '@nestjs/swagger';
import {GetMeta} from '../_shared/decorator';

class ListDocumentsQueryDTO {
  @ApiProperty({required: false, default: 1})
  page?: number;

  @ApiProperty({required: false, default: 20})
  limit?: number;

  @ApiProperty({required: false, enum: DocumentStatusEnum, default: DocumentStatusEnum.PENDING})
  status?: DocumentStatusEnum;
}

class ReviewDocumentParamDTO {
  @ApiPropertyOf(DocumentEntity, 'id')
  documentId!: string;
}

class ReviewDocumentBodyDTO {
  @ApiProperty({enum: DocumentStatusEnum})
  status!: DocumentStatusEnum;

  @ApiProperty({required: false})
  rejectReason?: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/kyc')
export class AdminKycController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('document')
  @ApiOkResponse({type: ListDocumentsToApproveResult})
  async listDocuments(
    @Query() query: ListDocumentsQueryDTO,
    @GetMeta() meta: GetMeta
  ): Promise<ListDocumentsToApproveResult> {
    return await this.queryBus.execute(
      new ListDocumentsToApproveQuery({
        ...meta,
        page: query.page,
        limit: query.limit,
        status: query.status,
      })
    );
  }

  @Patch('document/:documentId/review')
  @ApiOkResponse()
  async reviewDocument(
    @Param() param: ReviewDocumentParamDTO,
    @Body() body: ReviewDocumentBodyDTO,
    @GetMeta() {userId: adminId, ...meta}: GetMeta
  ): Promise<void> {
    await this.commandBus.execute(new ReviewDocumentCommand({...meta, ...param, ...body, adminId}));
  }
}
