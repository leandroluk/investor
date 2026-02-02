import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const query = z.object({
  correlationId: z.string().default(() => uuid.v7()),
});

export abstract class Query<TType = object, TUnion = TType & z.infer<typeof query>> {
  @ApiProperty({description: 'Unique identifier of the query'})
  readonly correlationId!: string;

  constructor(payload?: TUnion, schema = z.object({})) {
    if (payload) {
      Object.assign(this, query.extend(schema.shape).parse(payload));
    }
  }
}
