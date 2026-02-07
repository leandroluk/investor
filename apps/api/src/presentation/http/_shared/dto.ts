import {ApiProperty} from '@nestjs/swagger';

export class ErrorDTO {
  @ApiProperty({
    description: 'Unique identifier for the request',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly correlationId!: string;

  @ApiProperty({
    description: 'Domain error code',
    example: 'context.example_error',
  })
  readonly code!: string;

  @ApiProperty({
    description: 'Human readable message',
    example: 'Some error message here',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'When the error occurred',
    example: new Date(),
  })
  readonly occurredAt!: Date;
}
