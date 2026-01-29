import {type CreatableEntity} from '#/core/domain/entity/creatable';
import {type IndexableEntity} from '#/core/domain/entity/indexable';
import {type AmountValueObject} from '#/core/domain/value-object/amount';
import {ApiProperty} from '@nestjs/swagger';

export class EarningEntity implements IndexableEntity, CreatableEntity {
  @ApiProperty({
    example: '018f3b5e-ccdd-7000-8000-000000000000',
    description: 'Unique identifier for the earning record (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-beef-7000-8000-000000000000',
    description: 'The identifier of the investment that generated this earning',
    format: 'uuid',
  })
  investmentId!: string;

  @ApiProperty({
    example: '0.005234',
    description: 'The amount earned in the native token of the strategy',
    type: String,
  })
  amountToken!: AmountValueObject;

  @ApiProperty({
    example: '15.50',
    description: 'The equivalent value of the earning in USD at the time of record',
    type: String,
  })
  amountUsd!: AmountValueObject;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the earning was recorded in the system',
  })
  createdAt!: Date;
}
