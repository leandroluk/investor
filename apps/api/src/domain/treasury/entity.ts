import {type ICreatable, type IIndexable, type IUpdatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {WithdrawalStatusEnum} from './enum';

export class WithdrawalEntity implements IIndexable, ICreatable, IUpdatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the withdrawal request (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the request',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last status change',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user who requested the withdrawal',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 500.0,
    description: 'Amount requested for withdrawal in USD',
  })
  amountUsd!: number;

  @ApiProperty({
    example: 'PENDING',
    description: 'Current status of the withdrawal process',
    enum: Object.values(WithdrawalStatusEnum),
    maxLength: 20,
  })
  status!: WithdrawalStatusEnum;

  @ApiProperty({
    example: '0xabc123...',
    description: 'Blockchain transaction hash after payout processing',
    nullable: true,
    maxLength: 66,
  })
  transactionHash!: string | null;
}
