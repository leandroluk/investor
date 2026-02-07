import {ApiPropertyOf} from '#/application/_shared/decorator';
import {DocumentEntity} from '#/domain/account/entity';
import {ApiProperty} from '@nestjs/swagger';

export class UploadDocumentBodyDTO {
  @ApiPropertyOf(DocumentEntity, 'type')
  readonly type!: DocumentEntity['type'];

  @ApiProperty({
    description: 'File content type',
    example: 'image/jpeg',
  })
  readonly contentType!: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024,
  })
  readonly size!: number;
}

export class UploadDocumentResultDTO {
  @ApiProperty({example: '018b7c86-8a9d-72c0-8339-2c7c5a5a7e3d'})
  readonly id!: string;

  @ApiProperty({example: 'https://storage...'})
  readonly uploadUrl!: string;

  @ApiProperty()
  readonly expiresAt!: Date;
}
