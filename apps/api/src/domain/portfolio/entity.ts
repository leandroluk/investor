import {type ICreatable, type IIndexable, type IUpdatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {InvestmentStatusEnum} from './enum';

export class EarningEntity implements IIndexable, ICreatable {
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

export class InvestmentEntity implements IIndexable, ICreatable, IUpdatable {
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
