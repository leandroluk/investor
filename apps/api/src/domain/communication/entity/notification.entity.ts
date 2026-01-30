import {type CreatableEntity, type IndexableEntity} from '#/domain/_shared/entity';
import {ApiProperty} from '@nestjs/swagger';

export class NotificationEntity implements IndexableEntity, CreatableEntity {
  @ApiProperty({
    example: '018f3b5e-9999-7000-8000-000000000000',
    description: 'Unique identifier for the notification (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The recipient of the notification',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'Investment Confirmed',
    description: 'A brief and descriptive title for the notification',
  })
  title!: string;

  @ApiProperty({
    example: 'Your investment of 1000 USD in the Stablecoin Strategy was successful.',
    description: 'The full content or message body of the notification',
  })
  message!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the user read the notification, or null if unread',
    nullable: true,
  })
  readAt!: Date | null;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the notification was generated and sent',
  })
  createdAt!: Date;
}
