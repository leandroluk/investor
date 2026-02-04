import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {ChallengeStatusEnum} from '../enum';

export class ChallengeEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the challenge (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user who must solve the challenge',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '2FA',
    description: 'Type of the challenge (e.g. 2FA, OTP)',
  })
  type!: string;

  @ApiProperty({
    description: 'The secret code or hash of the challenge',
    writeOnly: true,
  })
  code!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Current status of the challenge',
    enum: Object.values(ChallengeStatusEnum),
  })
  status!: ChallengeStatusEnum;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the challenge expires',
  })
  expiresAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of creation',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update',
  })
  updatedAt!: Date;
}
