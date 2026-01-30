import {type TCreatableEntity, type TIndexableEntity} from '#/domain/_shared/type';
import {ApiProperty} from '@nestjs/swagger';

export class NoticeEntity implements TIndexableEntity, TCreatableEntity {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the notification (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'Investment Confirmed',
    description: 'Title of the notification',
  })
  title!: string;

  @ApiProperty({
    example: false,
    description: 'Read status of the message',
  })
  isRead!: boolean;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The recipient of the notice',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the notice was sent',
  })
  createdAt!: Date;
}
