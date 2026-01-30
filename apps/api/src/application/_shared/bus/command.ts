import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

const command = z.object({messageId: z.string(), occurredAt: z.date()});

export abstract class Command<TType extends object, TUnion = TType & z.infer<typeof command>> {
  @ApiProperty({description: 'Unique identifier of the command'})
  readonly messageId!: string;

  @ApiProperty({description: 'Date and time when the command was created'})
  readonly occurredAt!: Date;

  constructor(payload: TUnion = {} as TUnion, schema = z.object()) {
    Object.assign(this, command.extend(schema).parse(payload));
  }
}
