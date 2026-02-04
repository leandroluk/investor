import {Envelope} from '#/application/_shared/bus';
import {ApiProperty} from '@nestjs/swagger';

export class ErrorDTO implements Envelope {
  @ApiProperty({example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier for the request'})
  readonly correlationId!: string;

  @ApiProperty({example: 'context.example_error', description: 'Domain error code'})
  readonly code!: string;

  @ApiProperty({example: 'Some error message here', description: 'Human readable message'})
  readonly message!: string;

  @ApiProperty({example: new Date(), description: 'When the error occurred'})
  readonly occurredAt!: Date;
}
