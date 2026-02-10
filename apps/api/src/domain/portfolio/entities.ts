import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';
import {InvestmentStatusEnum} from './enums';

export class EarningEntity extends createClass(
  indexableSchema //
    .extend(creatableSchema.shape)
    .extend({
      investmentId: z.uuid().meta({
        example: '018f3b5e-beef-7000-8000-000000000000',
        description: 'The identifier of the investment that generated this earning',
        format: 'uuid',
      }),
      amountToken: z.number().meta({
        example: 0.005234,
        description: 'The amount earned in the native token of the strategy',
      }),
      amountUsd: z.number().meta({
        example: 15.5,
        description: 'The equivalent value of the earning in USD at the time of record',
      }),
    })
) {}

export class InvestmentEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      strategyId: z.uuid().meta({
        example: 'stable-yield-v1',
        description: 'The strategy chosen for this investment',
        format: 'uuid',
      }),
      assetId: z.uuid().meta({
        example: 'usdc-polygon',
        description: 'The asset used for the investment',
        format: 'uuid',
      }),
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The owner of the investment',
        format: 'uuid',
      }),
      amount: z.number().meta({
        example: 1000.0,
        description: 'Amount invested in token units',
      }),
      amountUsd: z.number().meta({
        example: 1000.0,
        description: 'Amount invested in USD equivalent at the time of creation',
      }),
      status: z.enum(InvestmentStatusEnum).meta({
        example: InvestmentStatusEnum.ACTIVE,
        description: 'Current status of the investment lifecycle',
        maxLength: 20,
      }),
    })
) {}
