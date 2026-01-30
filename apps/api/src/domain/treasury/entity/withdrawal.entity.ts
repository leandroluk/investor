import {type CreatableEntity, type IndexableEntity, type UpdatableEntity} from '#/domain/_shared/entity';
import {type AddressValueObject, type AmountValueObject} from '#/domain/_shared/value-object';
import {ApiProperty} from '@nestjs/swagger';
import {WithdrawalStatusEnum} from '../enum';

export class WithdrawalEntity implements IndexableEntity, CreatableEntity, UpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-eeee-7000-8000-000000000000',
    description: 'Unique identifier for the withdrawal request (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user requesting the funds withdrawal',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '018f3b5e-beef-7000-8000-000000000000',
    description: 'The specific investment being liquidated',
    format: 'uuid',
  })
  investmentId!: string;

  @ApiProperty({
    example: '10.500234',
    description: 'The amount of tokens to be withdrawn',
    type: String,
  })
  amountToken!: AmountValueObject;

  @ApiProperty({
    example: '1000.00',
    description: 'The equivalent USD value at the time of withdrawal request',
    type: String,
  })
  amountUsd!: AmountValueObject;

  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e2b1b2c3d4e5f6g7h8i9j0k1l',
    description: 'The blockchain address where the funds will be sent',
    type: String,
  })
  destinationAddress!: AddressValueObject;

  @ApiProperty({
    example: '0x9b1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f',
    description: 'The transaction hash of the successful withdrawal on the blockchain',
    nullable: true,
  })
  txHash!: string | null;

  @ApiProperty({
    example: 'PENDING',
    description: 'The current state of the withdrawal process',
    enum: Object.values(WithdrawalStatusEnum),
  })
  status!: WithdrawalStatusEnum;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the withdrawal request was created',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last status update',
  })
  updatedAt!: Date;
}
