import uuid from 'uuid';
import z from 'zod';

export const creatableSchema = z.object({
  createdAt: z
    .date()
    .default(() => new Date())
    .meta({
      description: 'Timestamp of creation',
      example: new Date(),
    }),
});

export type TCreatable = z.infer<typeof creatableSchema>;

export const deletableSchema = z.object({
  deletedAt: z.date().nullable().default(null).meta({
    description: 'Timestamp when the entity was soft deleted',
    example: new Date(),
  }),
});

export type TDeletable = z.infer<typeof deletableSchema>;

export const indexableSchema = z.object({
  id: z
    .uuid()
    .default(() => uuid.v7())
    .meta({
      description: 'Unique identifier for the entity (UUIDv7)',
      example: '018f3b5e-9012-7000-8000-000000000000',
      format: 'uuid',
    }),
});

export type TIndexable = z.infer<typeof indexableSchema>;

export const updatableSchema = z.object({
  updatedAt: z
    .date()
    .default(() => new Date())
    .meta({
      description: 'Timestamp of the last update',
      example: new Date(),
    }),
});

export type TUpdatable = z.infer<typeof updatableSchema>;
