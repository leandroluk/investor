import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {InvestmentStatusEnum} from '../enum';

export class InvestmentEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the investment (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the investment intent creation',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last status update (e.g., confirmation)',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: 'stable-yield-v1',
    description: 'The strategy chosen for this investment',
    format: 'uuid',
  })
  strategyId!: string;

  @ApiProperty({
    example: 'usdc-polygon',
    description: 'The asset used for the investment',
    format: 'uuid',
  })
  assetId!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The owner of the investment',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 1000.0,
    description: 'Amount invested in USD equivalent at the time of creation',
  })
  amountUsd!: number;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Current status of the investment lifecycle',
    enum: Object.values(InvestmentStatusEnum),
    maxLength: 20,
  })
  status!: InvestmentStatusEnum;
}
