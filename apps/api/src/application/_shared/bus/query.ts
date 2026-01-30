import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const query = z.object({messageId: z.string()});

export abstract class Query<TType = object, TUnion = TType & z.infer<typeof query>> {
  @ApiProperty({description: 'Unique identifier of the query'})
  readonly messageId!: string;

  constructor(payload: TUnion = {} as TUnion, schema = z.object({})) {
    Object.assign(this, query.extend(schema.shape).parse(payload));
  }
}
