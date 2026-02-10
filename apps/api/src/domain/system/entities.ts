import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';

export class ConfigEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      key: z.string().meta({
        example: 'MAINTENANCE_MODE',
        description: 'The unique key identifying the configuration setting',
        maxLength: 100,
      }),
      value: z.string().meta({
        example: 'false',
        description: 'The value associated with the configuration key, stored as a string',
      }),
      description: z.string().nullable().meta({
        example: 'Toggles system-wide maintenance mode.',
        description: 'Explanation of what this config key controls',
      }),
    })
) {}
