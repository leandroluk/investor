import {type Creatable, type Indexable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class EarningEntity implements Indexable, Creatable {
  @ApiProperty({
    example: '018f3b5e-ccdd-7000-8000-000000000000',
    description: 'Unique identifier for the earning record (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the earning was recorded in the system',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '018f3b5e-beef-7000-8000-000000000000',
    description: 'The identifier of the investment that generated this earning',
    format: 'uuid',
  })
  investmentId!: string;

  @ApiProperty({
    example: 0.005234,
    description: 'The amount earned in the native token of the strategy',
  })
  amountToken!: number;

  @ApiProperty({
    example: 15.5,
    description: 'The equivalent value of the earning in USD at the time of record',
  })
  amountUsd!: number;
}
