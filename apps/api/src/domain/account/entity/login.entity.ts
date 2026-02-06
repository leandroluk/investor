import {type Creatable, type Indexable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class LoginEntity implements Indexable, Creatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the login event (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the attempt (Immutable)',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user associated with the attempt',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address of the login attempt',
    maxLength: 50,
  })
  ip!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the authentication was successful',
  })
  success!: boolean;
}
