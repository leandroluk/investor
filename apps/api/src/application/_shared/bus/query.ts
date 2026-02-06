import uuid from 'uuid';
import z from 'zod';

const query = z.object({
  correlationId: z.uuid().default(() => uuid.v7()),
});

export abstract class Query<TType = object, TUnion = TType & z.infer<typeof query>> {
  readonly correlationId!: string;

  constructor(payload?: TUnion, schema = z.object({})) {
    if (payload) {
      Object.assign(this, query.extend(schema.shape).parse(payload));
    }
  }
}
