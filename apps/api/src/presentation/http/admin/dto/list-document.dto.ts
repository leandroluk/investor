import {DocumentStatusEnum} from '#/domain/account/enums';
import {ApiProperty} from '@nestjs/swagger';

export class ListDocumentQueryDTO {
  @ApiProperty({required: false, default: 1})
  page: number = 1;

  @ApiProperty({required: false, default: 20})
  limit: number = 20;

  @ApiProperty({required: false, enum: DocumentStatusEnum, default: DocumentStatusEnum.PENDING})
  status: DocumentStatusEnum = DocumentStatusEnum.PENDING;
}
