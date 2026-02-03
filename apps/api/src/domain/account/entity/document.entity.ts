import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class DocumentEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the document (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'User ID who uploaded this document',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'RG_FRONT',
    description: 'Document type',
    enum: ['RG_FRONT', 'RG_BACK', 'SELFIE', 'PROOF_OF_ADDRESS'],
  })
  type!: string;

  @ApiProperty({
    example: 'kyc/018f3b5e-9012-7000-8000-000000000000/rg-front.jpg',
    description: 'Storage key (S3 or similar)',
  })
  storageKey!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Document verification status',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Reason for rejection if status is REJECTED',
    nullable: true,
  })
  rejectReason!: string | null;

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
}
