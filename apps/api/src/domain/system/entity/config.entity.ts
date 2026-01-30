import {type TCreatableEntity, type TIndexableEntity, type TUpdatableEntity} from '#/domain/_shared/type';
import {ApiProperty} from '@nestjs/swagger';

export class ConfigEntity implements TIndexableEntity, TCreatableEntity, TUpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-aaaa-7000-8000-000000000000',
    description: 'Unique identifier for the configuration entry (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'MAINTENANCE_MODE',
    description: 'The unique key identifying the configuration setting',
    uniqueItems: true,
  })
  key!: string;

  @ApiProperty({
    example: 'false',
    description: 'The value associated with the configuration key, stored as a string',
  })
  value!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the configuration was first created',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last modification to the configuration value',
  })
  updatedAt!: Date;
}
