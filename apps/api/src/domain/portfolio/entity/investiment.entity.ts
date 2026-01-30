import {type TCreatableEntity, type TIndexableEntity, type TUpdatableEntity} from '#/domain/_shared/type';
import {ApiProperty} from '@nestjs/swagger';
import {InvestmentStatusEnum} from '../enum';

export class InvestmentEntity implements TIndexableEntity, TCreatableEntity, TUpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the investment (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'stable-yield-v1',
    description: 'The strategy chosen for this investment',
  })
  strategyId!: string;

  @ApiProperty({
    example: 'usdc-polygon',
    description: 'The asset used for the investment',
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
    example: 'active',
    description: 'Current status of the investment lifecycle',
    enum: Object.values(InvestmentStatusEnum),
  })
  status!: InvestmentStatusEnum;

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
}
