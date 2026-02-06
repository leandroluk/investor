import {type Creatable, type Indexable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class NoticeEntity implements Indexable, Creatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the notification (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the notice was sent',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The recipient of the notice',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'Investment Confirmed',
    description: 'Title of the notification',
    maxLength: 150,
  })
  title!: string;

  @ApiProperty({
    example: false,
    description: 'Read status of the message',
  })
  isRead!: boolean;
}
