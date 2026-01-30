import {ApiProperty} from '@nestjs/swagger';

export class ErrorResult {
  @ApiProperty({example: 'USER_ALREADY_EXISTS', description: 'Domain error code'})
  readonly code!: string;

  @ApiProperty({example: 'The provided email is already in use.', description: 'Human readable message'})
  readonly message!: string;

  @ApiProperty({example: new Date(), description: 'When the error occurred'})
  readonly occurredAt!: Date;
}
