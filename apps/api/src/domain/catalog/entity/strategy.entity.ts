import {type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class StrategyEntity implements Indexable, Updatable {
  @ApiProperty({
    example: 'stable-yield-v1',
    description: 'Unique slug for the investment strategy',
  })
  id!: string;

  @ApiProperty({
    example: 'Conservative strategy focused on stablecoins lending.',
    description: 'Detailed explanation of the strategy risks and mechanisms',
  })
  description!: string;

  @ApiProperty({
    example: 5.5,
    description: 'Minimum expected Annual Percentage Yield (APY)',
  })
  expectedApyRangeLow!: number;

  @ApiProperty({
    example: 8.2,
    description: 'Maximum expected Annual Percentage Yield (APY)',
  })
  expectedApyRangeHigh!: number;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of strategy creation',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last strategy adjustment',
  })
  updatedAt!: Date;
}
