import {type CreatableEntity} from '#/core/domain/entity/creatable';
import {type IndexableEntity} from '#/core/domain/entity/indexable';
import {ApiProperty} from '@nestjs/swagger';

export class LoginEntity implements IndexableEntity, CreatableEntity {
  @ApiProperty({
    example: '018f3b5e-aabb-7000-8000-000000000000',
    description: 'Unique identifier for the login event (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user who performed the login',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'The specific device used for this session',
    format: 'uuid',
  })
  deviceId!: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'The IP address from which the request originated',
    format: 'ipv4',
  })
  ip!: string;

  @ApiProperty({
    example: 'São Paulo, BR',
    description: 'Geographic location inferred from the IP address',
    nullable: true,
  })
  location!: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'The exact timestamp when the login occurred',
  })
  createdAt!: Date;
}
