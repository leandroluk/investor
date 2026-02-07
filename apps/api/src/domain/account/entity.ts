import {type ICreatable, type IDeletable, type IIndexable, type IUpdatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {
  ChallengeStatusEnum,
  DeviceTypeEnum,
  DocumentStatusEnum,
  DocumentTypeEnum,
  KycStatusEnum,
  UserStatusEnum,
} from './enum';

export class ChallengeEntity implements IIndexable, ICreatable, IUpdatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the challenge (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

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

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The user who must solve the challenge',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: '2FA',
    description: 'Type of the challenge (e.g. 2FA, OTP)',
    maxLength: 50,
  })
  type!: string;

  @ApiProperty({
    example: '123456',
    description: 'The secret code or hash of the challenge',
    maxLength: 255,
  })
  code!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Current status of the challenge',
    enum: Object.values(ChallengeStatusEnum),
    maxLength: 20,
  })
  status!: ChallengeStatusEnum;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the challenge expires',
  })
  expiresAt!: Date;
}

export class DeviceEntity implements IIndexable, ICreatable, IUpdatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the registered device (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

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

  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'The owner of this device registration',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'ios',
    description: 'Operational system platform',
    enum: Object.values(DeviceTypeEnum),
    maxLength: 20,
  })
  platform!: DeviceTypeEnum;

  @ApiProperty({
    example: 'fingerprint_82h1...',
    description: 'Unique fingerprint for device identification',
    maxLength: 255,
  })
  fingerprint!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the device is active for push notifications',
  })
  isActive!: boolean;

  @ApiProperty({
    example: 'Apple',
    description: 'Manufacturer of the device',
    maxLength: 50,
  })
  brand!: string;

  @ApiProperty({
    example: 'My iPhone',
    description: 'User-friendly name for the device',
    maxLength: 50,
  })
  name!: string;

  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Specific hardware model for device fingerprinting and anti-fraud analysis',
    maxLength: 50,
  })
  model!: string;
}

export class DocumentEntity implements IIndexable, ICreatable, IUpdatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the document (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of document upload',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'User ID who uploaded this document',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'RG_FRONT',
    description: 'Document type',
    enum: Object.values(DocumentTypeEnum),
    maxLength: 50,
  })
  type!: DocumentTypeEnum;

  @ApiProperty({
    example: 'kyc/018f3b5e-9012-7000-8000-000000000000/rg-front.jpg',
    description: 'Storage key (S3 or similar)',
    maxLength: 255,
  })
  storageKey!: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Document verification status',
    enum: Object.values(DocumentStatusEnum),
    maxLength: 20,
  })
  status!: DocumentStatusEnum;

  @ApiProperty({
    description: 'Reason for rejection if status is REJECTED',
    nullable: true,
  })
  rejectReason!: string | null;
}

export class LoginEntity implements IIndexable, ICreatable {
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

export class UserEntity implements IIndexable, ICreatable, IUpdatable, IDeletable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the user (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of account creation',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last profile update',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the user was soft deleted',
    nullable: true,
  })
  deletedAt!: Date | null;

  @ApiProperty({
    example: 'john.doe@email.com',
    description: 'Unique electronic mail address',
    maxLength: 100,
  })
  email!: string;

  @ApiProperty({
    description: 'Bcrypt or Argon2 hashed password',
    writeOnly: true,
  })
  passwordHash!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Current account lifecycle status',
    enum: Object.values(UserStatusEnum),
    maxLength: 20,
  })
  status!: UserStatusEnum;

  @ApiProperty({
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    description: 'Ethereum-compatible wallet address',
    nullable: true,
    maxLength: 42,
  })
  walletAddress!: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the wallet ownership was verified via signature',
    nullable: true,
  })
  walletVerifiedAt!: Date | null;

  @ApiProperty({
    description: 'Encrypted BIP39 seed phrase for wallet recovery',
    nullable: true,
    writeOnly: true,
  })
  walletSeedEncrypted!: string | null;

  @ApiProperty({
    example: 'NONE',
    description: 'KYC verification status',
    enum: Object.values(KycStatusEnum),
    maxLength: 20,
  })
  kycStatus!: KycStatusEnum;

  @ApiProperty({
    description: 'Timestamp when KYC was verified',
    nullable: true,
  })
  kycVerifiedAt!: Date | null;

  @ApiProperty({
    example: false,
    description: 'Whether the user has enabled Two-Factor Authentication',
  })
  twoFactorEnabled!: boolean;

  @ApiProperty({
    example: 'en',
    description: 'User preferred language (ISO 639-1 code)',
    maxLength: 10,
  })
  language!: string;

  @ApiProperty({
    example: 'America/Sao_Paulo',
    description: 'User preferred timezone (IANA format)',
    maxLength: 100,
  })
  timezone!: string;
}
