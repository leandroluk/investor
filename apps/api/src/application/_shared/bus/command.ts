import {ApiProperty} from '@nestjs/swagger';
import uuid from 'uuid';
import z from 'zod';

const command = z.object({
  correlationId: z.string().default(() => uuid.v7()),
  occurredAt: z.date().default(() => new Date()),
});

export abstract class Command<TType extends object, TUnion = TType & z.infer<typeof command>> {
  @ApiProperty({description: 'Unique identifier of the command'})
  readonly correlationId!: string;

  @ApiProperty({description: 'Date and time when the command was created'})
  readonly occurredAt!: Date;

  constructor(payload?: TUnion, schema = z.object()) {
    if (payload) {
      Object.assign(this, command.extend(schema.shape).parse(payload));
    }
  }
}
