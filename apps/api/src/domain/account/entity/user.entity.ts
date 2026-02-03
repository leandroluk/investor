import {type Creatable, type Indexable, type Updatable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';
import {UserStatusEnum} from '../enum';
export class UserEntity implements Indexable, Creatable, Updatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the user (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'john.doe@email.com',
    description: 'Unique electronic mail address',
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
  })
  name!: string;

  @ApiProperty({
    example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    description: 'Ethereum-compatible wallet address',
    nullable: true,
  })
  walletAddress!: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the wallet ownership was verified via signature',
    nullable: true,
  })
  walletVerifiedAt!: Date | null;

  @ApiProperty({
    example: 'active',
    description: 'Current account lifecycle status',
    enum: Object.values(UserStatusEnum),
  })
  status!: UserStatusEnum;

  @ApiProperty({
    example: false,
    description: 'Whether the user has enabled Two-Factor Authentication',
  })
  twoFactorEnabled!: boolean;

  @ApiProperty({
    description: 'Encrypted BIP39 seed phrase for wallet recovery',
    nullable: true,
    writeOnly: true,
  })
  walletSeedEncrypted!: string | null;

  @ApiProperty({
    example: 'NONE',
    description: 'KYC verification status',
    enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
  })
  kycStatus!: string;

  @ApiProperty({
    description: 'Timestamp when KYC was verified',
    nullable: true,
  })
  kycVerifiedAt!: Date | null;

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
}
