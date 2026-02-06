import uuid from 'uuid';
import z from 'zod';

const command = z.object({
  correlationId: z.uuid().default(() => uuid.v7()),
  occurredAt: z.date().default(() => new Date()),
});

export abstract class Command<TType extends object, TUnion = TType & z.infer<typeof command>> {
  readonly correlationId!: string;
  readonly occurredAt!: Date;

  constructor(payload?: TUnion, schema = z.object()) {
    if (payload) {
      Object.assign(this, command.extend(schema.shape).parse(payload));
    }
  }
}
