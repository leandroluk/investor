import {ApiProperty} from '@nestjs/swagger';

export class ErrorResult {
  @ApiProperty({example: 'context.example_error', description: 'Domain error code'})
  readonly code!: string;

  @ApiProperty({example: 'Some error message here', description: 'Human readable message'})
  readonly message!: string;

  @ApiProperty({example: new Date(), description: 'When the error occurred'})
  readonly occurredAt!: Date;
}
