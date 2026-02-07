import {UploadDocumentCommand} from '#/application/user/command';
import {ListUserDocumentsQuery, ListUserDocumentsResult} from '#/application/user/query';
import {Body, Controller, Get, Post} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta} from '../_shared/decorator';
import {UploadDocumentBodyDTO, UploadDocumentResultDTO} from './kyc.dto';

@ApiTags('account')
@ApiBearerAuth()
@Controller('kyc')
export class KycController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('document')
  @ApiCreatedResponse({type: UploadDocumentResultDTO})
  async uploadDocument(
    @Body() body: UploadDocumentBodyDTO,
    @GetMeta() meta: GetMeta
  ): Promise<UploadDocumentResultDTO> {
    const result = await this.commandBus.execute(new UploadDocumentCommand({...meta, ...body, type: body.type as any}));
    return result;
  }

  @Get('document')
  @ApiOkResponse({type: ListUserDocumentsResult})
  async listDocuments(
    @GetMeta() meta: GetMeta //
  ): Promise<ListUserDocumentsResult> {
    return await this.queryBus.execute(new ListUserDocumentsQuery({...meta}));
  }
}
