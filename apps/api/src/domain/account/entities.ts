import z from 'zod';
import {createClass} from '../_shared/factories';
import {creatableSchema, indexableSchema, updatableSchema} from '../_shared/types';
import {
  ChallengeStatusEnum,
  DeviceTypeEnum,
  DocumentStatusEnum,
  DocumentTypeEnum,
  KycStatusEnum,
  UserStatusEnum,
} from './enums';

export class ChallengeEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The user who must solve the challenge',
        format: 'uuid',
      }),
      type: z.string().meta({
        example: '2FA',
        description: 'Type of the challenge (e.g. 2FA, OTP)',
        maxLength: 50,
      }),
      code: z.string().meta({
        example: '123456',
        description: 'The secret code or hash of the challenge',
        maxLength: 255,
      }),
      status: z.enum(ChallengeStatusEnum).meta({
        example: ChallengeStatusEnum.PENDING,
        description: 'Current status of the challenge',
        maxLength: 20,
      }),
      expiresAt: z.date().meta({
        example: new Date(),
        description: 'Timestamp when the challenge expires',
      }),
    })
) {}

export class DeviceEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The owner of this device registration',
        format: 'uuid',
      }),
      platform: z.enum(DeviceTypeEnum).meta({
        example: DeviceTypeEnum.IOS,
        description: 'Operational system platform',
        maxLength: 20,
      }),
      fingerprint: z.string().meta({
        example: 'fingerprint_82h1...',
        description: 'Unique fingerprint for device identification',
        maxLength: 255,
      }),
      isActive: z.boolean().meta({
        example: true,
        description: 'Whether the device is active for push notifications',
      }),
      brand: z.string().meta({
        example: 'Apple',
        description: 'Manufacturer of the device',
        maxLength: 50,
      }),
      name: z.string().meta({
        example: 'My iPhone',
        description: 'User-friendly name for the device',
        maxLength: 50,
      }),
      model: z.string().meta({
        example: 'iPhone 15 Pro',
        description: 'Specific hardware model for device fingerprinting and anti-fraud analysis',
        maxLength: 50,
      }),
    })
) {}

export class DocumentEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-9012-7000-8000-000000000000',
        description: 'User ID who uploaded this document',
        format: 'uuid',
      }),
      type: z.enum(DocumentTypeEnum).meta({
        example: DocumentTypeEnum.RG_FRONT,
        description: 'Document type',
        maxLength: 50,
      }),
      storageKey: z.string().meta({
        example: 'kyc/018f3b5e-9012-7000-8000-000000000000/rg-front.jpg',
        description: 'Storage key (S3 or similar)',
        maxLength: 255,
      }),
      status: z.enum(DocumentStatusEnum).meta({
        example: DocumentStatusEnum.APPROVED,
        description: 'Document verification status',
        maxLength: 20,
      }),
      rejectReason: z.string().nullable().meta({
        description: 'Reason for rejection if status is REJECTED',
      }),
    })
) {}

export class LoginEntity extends createClass(
  indexableSchema //
    .extend(creatableSchema.shape)
    .extend({
      userId: z.uuid().meta({
        example: '018f3b5e-1234-7000-8000-000000000000',
        description: 'The user associated with the attempt',
        format: 'uuid',
      }),
      ip: z.string().meta({
        example: '192.168.1.1',
        description: 'IP address of the login attempt',
        maxLength: 50,
      }),
      success: z.boolean().meta({
        example: true,
        description: 'Whether the authentication was successful',
      }),
    })
) {}

export class UserEntity extends createClass(
  indexableSchema
    .extend(creatableSchema.shape)
    .extend(updatableSchema.shape)
    .extend({
      deletedAt: z.date().nullable().meta({
        example: new Date(),
        description: 'Timestamp when the user was soft deleted',
      }),
      email: z.string().email().meta({
        example: 'john.doe@email.com',
        description: 'Unique electronic mail address',
        maxLength: 100,
      }),
      passwordHash: z.string().meta({
        description: 'Bcrypt or Argon2 hashed password',
        writeOnly: true,
      }),
      name: z.string().meta({
        example: 'John Doe',
        description: 'Full name of the user',
        maxLength: 100,
      }),
      status: z.enum(UserStatusEnum).meta({
        example: UserStatusEnum.ACTIVE,
        description: 'Current account lifecycle status',
        maxLength: 20,
      }),
      walletAddress: z.string().nullable().meta({
        example: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        description: 'Ethereum-compatible wallet address',
        maxLength: 42,
      }),
      walletVerifiedAt: z.date().nullable().meta({
        example: new Date(),
        description: 'Timestamp when the wallet ownership was verified via signature',
      }),
      walletSeedEncrypted: z.string().nullable().meta({
        description: 'Encrypted BIP39 seed phrase for wallet recovery',
        writeOnly: true,
      }),
      kycStatus: z.enum(KycStatusEnum).meta({
        example: KycStatusEnum.APPROVED,
        description: 'KYC verification status',
        maxLength: 20,
      }),
      kycVerifiedAt: z.date().nullable().meta({
        example: new Date(),
        description: 'Timestamp when KYC was verified',
      }),
      twoFactorEnabled: z.boolean().meta({
        example: false,
        description: 'Whether the user has enabled Two-Factor Authentication',
      }),
      language: z.string().meta({
        example: 'en',
        description: 'User preferred language (ISO 639-1 code)',
        maxLength: 10,
      }),
      timezone: z.string().meta({
        example: 'America/Sao_Paulo',
        description: 'User preferred timezone (IANA format)',
        maxLength: 100,
      }),
    })
) {}
