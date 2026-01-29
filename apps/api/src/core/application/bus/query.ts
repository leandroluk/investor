import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

export abstract class Query<TType extends object> {
  @ApiProperty({description: 'Unique identifier of the query'})
  readonly messageId!: string;

  constructor(payload: TType = {} as TType, schema: z.ZodObject = z.object({})) {
    const baseSchema = z.object({
      messageId: z.string(),
      occurredAt: z.date().optional(),
    });

    const finalSchema = baseSchema.extend(schema.shape);

    Object.assign(this, finalSchema.parse(payload));
  }
}
