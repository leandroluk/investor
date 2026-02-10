import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';
import {WithdrawalStatusEnum} from './enums';

export class WithdrawalEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The user who requested the withdrawal',
        format: 'uuid',
      }),
      assetId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The asset being withdrawn',
        format: 'uuid',
      }),
      amount: z.number().meta({
        example: 50.5,
        description: 'Amount requested for withdrawal in crypto units',
      }),
      amountUsd: z.number().meta({
        example: 500,
        description: 'Amount requested for withdrawal in USD',
      }),
      status: z.enum(WithdrawalStatusEnum).meta({
        example: WithdrawalStatusEnum.COMPLETED,
        description: 'Current status of the withdrawal process',
        maxLength: 20,
      }),
      destinationAddress: z.string().meta({
        example: '0xabc123...',
        description: 'Destination wallet address',
        maxLength: 42,
      }),
      txHash: z.string().nullable().meta({
        example: '0xabc123...',
        description: 'Blockchain transaction hash after payout processing',
        maxLength: 66,
      }),
    })
) {}
