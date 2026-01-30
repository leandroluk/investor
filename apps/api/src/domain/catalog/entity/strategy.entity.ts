import {type CreatableEntity, type IndexableEntity, type UpdatableEntity} from '#/domain/_shared/entity';
import {type ApyRangeValueObject} from '#/domain/_shared/value-object';
import {ApiProperty} from '@nestjs/swagger';

export class StrategyEntity implements IndexableEntity, CreatableEntity, UpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-5678-7000-8000-000000000000',
    description: 'Unique identifier for the investment strategy (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The identifier of the base asset used in this strategy',
    format: 'uuid',
  })
  assetId!: string;

  @ApiProperty({
    example: 'Stablecoin Yield Optimizer',
    description: 'A concise name identifying the investment strategy',
  })
  name!: string;

  @ApiProperty({
    example: 'High-yield strategy focused on lending stablecoins through Aave and Compound protocols.',
    description: 'Detailed explanation of the strategy risks, protocols involved, and mechanics',
  })
  description!: string;

  @ApiProperty({
    description: 'The expected Annual Percentage Yield (APY) range based on historical data and protocol rewards',
    example: {low: 5.5, high: 12.2},
    type: 'object',
    properties: {
      low: {type: 'number', example: 5.5},
      high: {type: 'number', example: 12.2},
    },
  })
  apyRange!: ApyRangeValueObject;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the strategy was first deployed to the catalog',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last modification to the strategy parameters',
  })
  updatedAt!: Date;
}
