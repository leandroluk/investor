import {type CreatableEntity} from '#/core/domain/entity/creatable';
import {type DeletableEntity} from '#/core/domain/entity/deletable';
import {type IndexableEntity} from '#/core/domain/entity/indexable';
import {type UpdatableEntity} from '#/core/domain/entity/updatable';
import {type EmailValueObject} from '#/core/domain/value-object/email.value-object';
import {type LanguageValueObject} from '#/core/domain/value-object/language.value-object';
import {type TimezoneValueObject} from '#/core/domain/value-object/timezone.value-object';
import {ApiProperty} from '@nestjs/swagger';
import {type PasswordValueObject} from '../value-object/password.value-object';

export class UserEntity implements IndexableEntity, CreatableEntity, UpdatableEntity, DeletableEntity {
  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The unique identifier for the user (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'investor@example.com',
    description: 'The primary email address used for authentication and notifications',
    type: String,
  })
  email!: EmailValueObject;

  @ApiProperty({
    description: 'The hashed password string. Never returned in plain text.',
    writeOnly: true,
    type: String,
  })
  password!: PasswordValueObject;

  @ApiProperty({
    example: 'John',
    description: 'The user’s first or given name',
  })
  givenName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The user’s family name or surname',
    nullable: true,
  })
  familyName!: string | null;

  @ApiProperty({
    example: 'en',
    description: 'Preferred ISO 639-1 language code for the interface',
    type: String,
  })
  language!: LanguageValueObject;

  @ApiProperty({
    example: 'America/Sao_Paulo',
    description: 'IANA Timezone string for accurate transaction reporting',
    type: String,
  })
  timezone!: TimezoneValueObject;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the user account was created',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update to user profile information',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Timestamp of soft deletion, if applicable',
    nullable: true,
  })
  deletedAt!: Date | null;
}
