import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema} from '../_shared/types';
import {LedgerTypeEnum} from './enums';

export class LedgerEntity extends createClass(
  indexableSchema //
    .extend(creatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The user associated with this financial record',
        format: 'uuid',
      }),
      type: z.enum(LedgerTypeEnum).meta({
        example: 'INVESTMENT',
        description: 'Type of financial event recorded',
        maxLength: 50,
      }),
      amountUsd: z.number().meta({
        example: 1500.5,
        description: 'The amount involved in the transaction in USD',
      }),
      referenceId: z.uuid().meta({
        example: '018f3b5e-5555-7000-8000-000000000000',
        description: 'ID of the original resource (investment_id, withdrawal_id, etc.)',
        format: 'uuid',
      }),
    })
) {}
