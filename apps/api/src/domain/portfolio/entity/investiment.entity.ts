import {
  type CreatableEntity,
  type DeletableEntity,
  type IndexableEntity,
  type UpdatableEntity,
} from '#/domain/_shared/entity';
import {type AmountValueObject} from '#/domain/_shared/value-object';
import {ApiProperty} from '@nestjs/swagger';
import {InvestmentStatusEnum} from '../enum';
import {ApySnapshotValueObject} from '../value-object';

export class InvestmentEntity implements IndexableEntity, CreatableEntity, UpdatableEntity, DeletableEntity {
  @ApiProperty({
    example: '018f3b5e-beef-7000-8000-000000000000',
    description: 'Unique identifier for the investment record (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The owner of this investment',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '018f3b5e-5678-7000-8000-000000000000',
    description: 'The strategy identifier chosen for this investment',
    format: 'uuid',
  })
  strategyId!: string;

  @ApiProperty({
    example: '10.500234',
    description: 'Initial invested amount in native tokens',
    type: String,
  })
  amountToken!: AmountValueObject;

  @ApiProperty({
    example: '1000.00',
    description: 'Initial invested amount in USD',
    type: String,
  })
  amountUsd!: AmountValueObject;

  @ApiProperty({
    example: '0.005234',
    description: 'Total accumulated yield in tokens',
    type: String,
  })
  yieldToken!: AmountValueObject;

  @ApiProperty({
    example: '15.50',
    description: 'Total accumulated yield in USD',
    type: String,
  })
  yieldUsd!: AmountValueObject;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Current status of the investment',
    enum: Object.values(InvestmentStatusEnum),
  })
  status!: InvestmentStatusEnum;

  @ApiProperty({
    description: 'Snapshot of the strategy APY at the moment of investment',
    example: {low: 5.5, high: 12.2},
    type: 'object',
    properties: {
      low: {type: 'number', example: 5.5},
      high: {type: 'number', example: 12.2},
    },
  })
  snapshot!: ApySnapshotValueObject;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e2b1b2c3d4e5f6g7h8i9j0k1l',
    description: 'Blockchain transaction hash for verification',
    nullable: true,
  })
  txHash!: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the investment was initiated',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update to investment state',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Timestamp of soft deletion or archive',
    nullable: true,
  })
  deletedAt!: Date | null;
}
