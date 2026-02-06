import {type Creatable, type Deletable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {KycStatusEnum, UserStatusEnum} from '../enum';

export class UserEntity implements Indexable, Creatable, Updatable, Deletable {
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
    enum: Object.values(KycStatusEnum), // Using verified KycStatusEnum
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
