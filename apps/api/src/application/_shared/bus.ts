import {createClass} from '#/domain/_shared/factories';
import uuid from 'uuid';
import {z} from 'zod';

export const Command = createClass(
  z.object({
    correlationId: z
      .uuid()
      .default(() => uuid.v7())
      .meta({
        description: 'Unique identifier for the request',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
    occurredAt: z
      .date()
      .default(() => new Date())
      .meta({
        description: 'Date and time when the command was occurred',
        example: new Date(),
      }),
  })
);

export type Command = InstanceType<typeof Command>;

export const Query = createClass(
  z.object({
    correlationId: z
      .uuid()
      .default(() => uuid.v7())
      .meta({
        description: 'Unique identifier for the request',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
  })
);

export type Query = InstanceType<typeof Command>;
