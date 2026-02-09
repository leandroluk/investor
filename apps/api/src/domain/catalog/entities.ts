import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';

export class AssetEntity extends createClass(
  indexableSchema //
    .extend(creatableSchema.shape)
    .extend({
      deletedAt: z.date().nullable().meta({
        example: new Date(),
        description: 'Timestamp when the asset was deleted',
      }),
      slug: z.string().meta({
        example: 'usdc-polygon',
        description: 'Unique identifier for the asset (slug)',
        maxLength: 50,
      }),
      symbol: z.string().meta({
        example: 'USDC',
        description: 'Ticker symbol of the asset',
        maxLength: 10,
      }),
      network: z.string().meta({
        example: 'polygon',
        description: 'Blockchain network where the asset resides',
        maxLength: 50,
      }),
      isActive: z.boolean().meta({
        example: true,
        description: 'Whether the asset is currently enabled for investments',
      }),
    })
) {}

export class StrategyEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      deletedAt: z.date().nullable().meta({
        example: new Date(),
        description: 'Timestamp when the strategy was deleted',
      }),
      alias: z.string().meta({
        example: 'stable-yield-v1',
        description: 'Unique slug for the investment strategy',
        maxLength: 50,
      }),
      description: z.string().meta({
        example: 'Conservative strategy focused on stablecoins lending.',
        description: 'Detailed explanation of the strategy risks and mechanisms',
      }),
      expectedApyRangeLow: z.number().meta({
        example: 5.5,
        description: 'Minimum expected Annual Percentage Yield (APY)',
      }),
      expectedApyRangeHigh: z.number().meta({
        example: 8.2,
        description: 'Maximum expected Annual Percentage Yield (APY)',
      }),
    })
) {}
