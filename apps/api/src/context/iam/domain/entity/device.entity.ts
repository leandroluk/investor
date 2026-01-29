import {type CreatableEntity} from '#/core/domain/entity/creatable';
import {type IndexableEntity} from '#/core/domain/entity/indexable';
import {type UpdatableEntity} from '#/core/domain/entity/updatable';
import {ApiProperty} from '@nestjs/swagger';
import {type PushTokenValueObject} from '../value-object/push-token.value-object';

export class DeviceEntity implements IndexableEntity, CreatableEntity, UpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the registered device (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The owner of this device registration',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'ios',
    description: 'Operational system platform',
    enum: ['ios', 'android', 'web'],
  })
  type!: 'ios' | 'android' | 'web';

  @ApiProperty({
    example: 'fCM_token_82h1...',
    description: 'Firebase Cloud Messaging or APNs push token for notifications',
    nullable: true,
    type: String,
  })
  pushToken!: PushTokenValueObject | null;

  @ApiProperty({
    example: 'Apple',
    description: 'Manufacturer of the device',
  })
  brand!: string;

  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Specific hardware model for device fingerprinting and anti-fraud analysis',
  })
  model!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the first device registration',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last device activity or token update',
  })
  updatedAt!: Date;
}
