import {ApiProperty} from '@nestjs/swagger';
import z from 'zod';

export abstract class Command<TType extends object> {
  @ApiProperty({description: 'Unique identifier of the command'})
  readonly messageId!: string;

  @ApiProperty({description: 'Date and time when the command was created'})
  readonly occurredAt!: Date;

  constructor(payload: TType = {} as TType, schema = z.object()) {
    Object.assign(this, z.object({messageId: z.string(), occurredAt: z.date()}).extend(schema).parse(payload));
  }
}
