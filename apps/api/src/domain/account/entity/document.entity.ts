import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {DocumentStatusEnum, DocumentTypeEnum} from '../enum';

export class DocumentEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the document (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of document upload',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'User ID who uploaded this document',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'RG_FRONT',
    description: 'Document type',
    enum: Object.values(DocumentTypeEnum),
    maxLength: 50,
  })
  type!: DocumentTypeEnum;

  @ApiProperty({
    example: 'kyc/018f3b5e-9012-7000-8000-000000000000/rg-front.jpg',
    description: 'Storage key (S3 or similar)',
    maxLength: 255,
  })
  storageKey!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Document verification status',
    enum: Object.values(DocumentStatusEnum),
    maxLength: 20,
  })
  status!: DocumentStatusEnum;

  @ApiProperty({
    description: 'Reason for rejection if status is REJECTED',
    nullable: true,
  })
  rejectReason!: string | null;
}
