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
        maxLength: 100,
      }),
      symbol: z.string().meta({
        example: 'USDC',
        description: 'Ticker symbol of the asset',
        maxLength: 10,
      }),
      name: z.string().meta({
        example: 'USD Coin',
        description: 'Full name of the asset',
        maxLength: 100,
      }),
      logoUrl: z.string().nullable().meta({
        example: 'https://example.com/usdc.png',
        description: 'URL of the asset logo',
        maxLength: 255,
      }),
      network: z.string().meta({
        example: 'polygon',
        description: 'Blockchain network where the asset resides',
        maxLength: 50,
      }),
      contract: z.string().nullable().meta({
        example: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        description: 'Smart contract address of the asset',
        maxLength: 42,
      }),
      decimals: z.number().int().default(18).meta({
        example: 6,
        description: 'Number of decimal places used by the asset',
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
      assetId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The base asset of the strategy',
        format: 'uuid',
      }),
      name: z.string().meta({
        example: 'Stable Yield V1',
        description: 'Display name of the strategy',
        maxLength: 100,
      }),
      slug: z.string().meta({
        example: 'stable-yield-v1',
        description: 'Unique slug for the investment strategy',
        maxLength: 100,
      }),
      description: z.string().nullable().meta({
        example: 'Conservative strategy focused on stablecoins lending.',
        description: 'Detailed explanation of the strategy risks and mechanisms',
      }),
      riskLevel: z.string().meta({
        example: 'LOW',
        description: 'Risk level of the strategy (LOW, MEDIUM, HIGH)',
        maxLength: 20,
      }),
      minApy: z.number().meta({
        example: 0.055,
        description: 'Minimum expected Annual Percentage Yield (APY)',
      }),
      maxApy: z.number().meta({
        example: 0.082,
        description: 'Maximum expected Annual Percentage Yield (APY)',
      }),
      minLockupSeconds: z.number().int().default(0).meta({
        example: 86400,
        description: 'Minimum lockup period in seconds',
      }),
    })
) {}
