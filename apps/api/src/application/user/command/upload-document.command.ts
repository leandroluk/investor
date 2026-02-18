import {Command} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {BrokerPort, StoragePort} from '#/domain/_shared/ports';
import {DocumentEntity, KycEntity, UserEntity} from '#/domain/account/entities';
import {DocumentStatusEnum, KycStatusEnum} from '#/domain/account/enums';
import {DeviceNotFoundError, KycNotFoundError, UserNotFoundError} from '#/domain/account/errors';
import {DocumentUploadedEvent} from '#/domain/account/events';
import {DeviceRepository, DocumentRepository, KycRepository, UserRepository} from '#/domain/account/repositories';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import z from 'zod';

export class UploadDocumentCommand extends createClass(
  Command,
  z.object({
    userId: UserEntity.schema.shape.id,
    fingerprint: z.string().min(1),
    type: DocumentEntity.schema.shape.type,
    contentType: z.string().min(1).meta({
      description: 'File content type',
      example: 'image/jpeg',
    }),
    size: z.coerce.number().positive().meta({
      description: 'File size in bytes',
      example: 1024,
    }),
  })
) {}

export class UploadDocumentCommandResult extends createClass(
  z.object({
    id: DocumentEntity.schema.shape.id,
    uploadURL: z.url().meta({
      description: 'URL to upload the document',
      example: 'https://storage...',
    }),
    expiresAt: z.date().meta({
      description: 'Expiration date of the upload URL',
      example: new Date(),
    }),
  })
) {}

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand, UploadDocumentCommandResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly kycRepository: KycRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly storagePort: StoragePort,
    private readonly brokerPort: BrokerPort
  ) {}

  private async getUserAndKyc(userId: UserEntity['id']): Promise<{user: UserEntity; kyc: KycEntity}> {
    const [user, kyc] = await Promise.all([
      this.userRepository.findById(userId),
      this.kycRepository.findByUserId(userId),
    ]);

    if (!user) {
      throw new UserNotFoundError();
    }
    if (!kyc) {
      throw new KycNotFoundError();
    }
    return {user, kyc};
  }

  private async getDevice(userId: string, fingerprint: string): Promise<string> {
    const device = await this.deviceRepository.findByFingerprint(userId, fingerprint);
    if (!device) {
      throw new DeviceNotFoundError();
    }
    return device.id;
  }

  private async createDocumentWithUploadURL(
    type: DocumentEntity['type'],
    user: UserEntity,
    kyc: KycEntity
  ): Promise<{document: DocumentEntity; uploadURL: string; expiresAt: Date}> {
    const document = DocumentEntity.new({
      userId: user.id,
      kycId: kyc.id,
      type,
      status: DocumentStatusEnum.PENDING,
      rejectReason: null,
      storageKey: '',
    });
    document.storageKey = `kyc/${user.id}/${type}-${document.id}`;
    await this.documentRepository.create(document);
    return {
      document,
      uploadURL: await this.storagePort.getSignedURL(document.storageKey, 15 * 60, 'write'),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };
  }

  private async updateKycStatus(kyc: KycEntity): Promise<void> {
    if (kyc.status === KycStatusEnum.NONE) {
      kyc.status = KycStatusEnum.PENDING;
      await this.kycRepository.update(kyc);
    }
  }

  private async publishDocumentUploadedEvent(
    correlationId: string,
    occurredAt: Date,
    document: DocumentEntity,
    deviceId: string
  ): Promise<void> {
    await this.brokerPort.publish(
      new DocumentUploadedEvent(correlationId, occurredAt, {
        documentId: document.id,
        documentUserId: document.userId,
        deviceId,
      })
    );
  }

  async execute(command: UploadDocumentCommand): Promise<UploadDocumentCommandResult> {
    const {userId, type, correlationId, occurredAt, fingerprint} = command;
    const {user, kyc} = await this.getUserAndKyc(userId);
    const deviceId = await this.getDevice(userId, fingerprint);

    const {document, uploadURL, expiresAt} = await this.createDocumentWithUploadURL(type, user, kyc);
    await this.updateKycStatus(kyc);
    await this.publishDocumentUploadedEvent(correlationId, occurredAt, document, deviceId);

    return UploadDocumentCommandResult.new({
      id: document.id,
      uploadURL,
      expiresAt,
    });
  }
}
