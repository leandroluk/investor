import {ApiPropertyOf} from '#/application/_shared/decorators';
import {DocumentEntity} from '#/domain/account/entities';
import {DocumentStatusEnum} from '#/domain/account/enums';
import {ApiProperty} from '@nestjs/swagger';

export class ReviewDocumentParamDTO {
  @ApiPropertyOf(DocumentEntity, 'id')
  documentId!: string;
}

export class ReviewDocumentBodyDTO {
  @ApiProperty({enum: DocumentStatusEnum})
  status!: DocumentStatusEnum;

  @ApiProperty({required: false})
  rejectReason?: string;
}
