import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {TicketStatusEnum} from '../enum';

export class TicketEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the support ticket (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user who opened the ticket',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'Unable to withdraw funds',
    description: 'Subject of the support request',
  })
  subject!: string;

  @ApiProperty({
    example: 'I am getting an error when trying to confirm my 2FA code during withdrawal.',
    description: 'Detailed description of the issue or feedback',
  })
  message!: string;

  @ApiProperty({
    example: 'open',
    description: 'Current status of the support request',
    enum: Object.values(TicketStatusEnum),
  })
  status!: TicketStatusEnum;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of ticket creation',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update from support or user',
  })
  updatedAt!: Date;
}
