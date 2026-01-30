import {type TCreatableEntity, type TIndexableEntity} from '#/domain/_shared/type';
import {ApiProperty} from '@nestjs/swagger';
import {LedgerTypeEnum} from '../enum';

export class LedgerEntity implements TIndexableEntity, TCreatableEntity {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the ledger entry (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user associated with this financial record',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'investment',
    description: 'Type of financial event recorded',
    enum: Object.values(LedgerTypeEnum),
  })
  type!: LedgerTypeEnum;

  @ApiProperty({
    example: 1500.5,
    description: 'The amount involved in the transaction in USD',
  })
  amountUsd!: number;

  @ApiProperty({
    example: '018f3b5e-5555-7000-8000-000000000000',
    description: 'ID of the original resource (investment_id, withdrawal_id, etc.)',
    format: 'uuid',
  })
  referenceId!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the record (Immutable)',
  })
  createdAt!: Date;
}
